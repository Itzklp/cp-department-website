const colors = require("colors");
const facultyModels = require("../models/facultyModels");
const XLSX = require("xlsx");
const fs = require("fs");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const logActivity = require("../utils/logger");

// ---- Helpers for bulk upload parsing ----
const cellStr = (val) => (val === undefined || val === null) ? "" : String(val).trim();

// Excel headers can carry \n/\r\n or extra spaces mid-word - strip ALL
// whitespace before matching so line-wrapped headers match reliably.
const normalizeKey = (k) => k.replace(/\s+/g, "").trim().toLowerCase();
const buildLookup = (row) => {
  const map = {};
  for (const key of Object.keys(row)) map[normalizeKey(key)] = row[key];
  return map;
};
const pick = (lookup, keys) => {
  for (const k of keys) {
    const v = lookup[normalizeKey(k)];
    if (v !== undefined && v !== null && cellStr(v) !== "") return v;
  }
  return undefined;
};

// Handles real Date objects, ISO strings, "D.M.YYYY" and "D-M-YYYY".
const parseFlexibleDate = (val) => {
  if (val === undefined || val === null || cellStr(val) === "") return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  const str = String(val).trim();
  const sepMatch = str.match(/^(\d{1,2})[.\-](\d{1,2})[.\-](\d{4})$/);
  if (sepMatch) {
    const [, day, month, year] = sepMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

// Splits a bullet/newline/comma/semicolon separated cell into a clean array.
// Handles "• A\r\n• B" style lists as well as plain "A, B" lists.
// Treats stray "0" (a common Excel artifact for an otherwise-empty cell) as empty.
const parseListValue = (val) => {
  if (val === undefined || val === null) return [];
  return String(val)
    .split(/\r?\n|,|;/)
    .map((s) => s.replace(/^[\s•\-*]+/, "").trim())
    .filter((s) => s.length > 0 && s !== "0" && s.toLowerCase() !== "none");
};

const isValidEmail = (s) => /\S+@\S+\.\S+/.test(s);

// Add Faculty
const addFaculty = async (req, res) => {
  try {
    const { 
      psrn,
      firstName, 
      lastName, 
      email, 
      instituteEmail,
      department, 
      researchArea, 
      teaches, 
      joiningDate,
      designation,
      mobileNo,
      chamberNo,
      intercomNo,
      promotedASTPDate,
      promotedASOPDate,
      promotedProfessorDate,
      promotedSrProfessorDate,
      phdScholarsSupervised,
      phdDacMembership,
      password
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !department) {
      return res.status(400).send({ success: false, message: "Missing fields" });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Only administrators can add new faculty." });
    }

    const existingFaculty = await facultyModels.findOne({ email });
    if (existingFaculty) {
      return res.status(400).send({ success: false, message: "Faculty already exists" });
    }

    const faculty = await facultyModels.create({
      psrn, firstName, lastName, email, instituteEmail, department, designation,
      researchArea, teaches, joiningDate,
      mobileNo, chamberNo, intercomNo,
      promotedASTPDate, promotedASOPDate, promotedProfessorDate, promotedSrProfessorDate,
      phdScholarsSupervised, phdDacMembership
    });

    // 2. AUTOMATIC USER CREATION (New Logic)
    // Check if user account already exists
    const existingUser = await User.findOne({ email });
    
    if (!existingUser) {
        // Create User with default password
        const generatedPassword = password; 
        
        const newUser = await User.create({
            name: `${firstName} ${lastName}`,
            email: email,
            password: generatedPassword,
            role: "faculty",
            facultyProfile: faculty._id,
            isFirstLogin: true
        });

        // LOG REGISTRATION
        await logActivity(email, 'REGISTER', `Admin ${req.user.name || 'System'} created new faculty account`, req.ip, newUser._id);

        // 3. Send Email Notification
        try {
            await sendEmail({
                email: email,
                subject: "Account Created - Department Website",
                message: `Hello ${firstName},\n\nYour faculty account has been created.\n\nLogin Credentials:\nUsername: ${email}\nPassword: ${generatedPassword}\n\nPlease login and change your password immediately.`
            });
        } catch (emailError) {
            console.error("Could not send email", emailError);
            // Don't fail the request if email fails, but log it
        }
    }

    res.status(201).send({
      success: true,
      message: "Faculty and User Account registered successfully",
      faculty,
    });

  } catch (error) {
    return res.status(500).send({ success: false, error: error.message });
  }
};

// Get all faculties
const getAllFaculty = async (req, res) => {
  try {
    const faculties = await facultyModels.find({});
    res.status(200).send({
      success: true,
      message: "Faculties fetched successfully",
      count: faculties.length,
      faculties,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error while fetching faculty",
      error: error.message.red.bold,
    });
  }
};

// Search faculty by name (firstName or lastName)
const getFacultyByName = async (req, res) => {
  try {
    const { name } = req.query; // single query param: ?name=Ka

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please provide a search term (name)",
      });
    }

    // Case-insensitive partial match on both firstName & lastName
    const faculty = await facultyModels.find({
      $or: [
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } }
      ],
    });

    if (!faculty || faculty.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No faculty found matching the search term",
      });
    }

    res.status(200).send({
      success: true,
      count: faculty.length,
      faculty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while searching faculty",
      error: error.message,
    });
  }
};

// Get faculty ID by exact firstName + lastName
const getFacultyIdByName = async (req, res) => {
  try {
    const { firstName, lastName } = req.query;

    if (!firstName || !lastName) {
      return res.status(400).send({
        success: false,
        message: "Please provide both firstName and lastName",
      });
    }

    const faculty = await facultyModels
      .findOne({
        firstName: { $regex: `^${firstName}$`, $options: "i" }, // exact match but case-insensitive
        lastName: { $regex: `^${lastName}$`, $options: "i" },
      })
      .select("_id"); // only fetch _id field

    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "No faculty found with the given firstName and lastName",
      });
    }

    res.status(200).send({
      success: true,
      facultyId: faculty._id, // only ID returned
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching faculty ID",
      error: error.message,
    });
  }
};

// Get faculty name by ID
const getFacultyNameById = async (req, res) => {
  try {
    const { id } = req.params; // expecting /name/by-id/:id

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Please provide faculty ID",
      });
    }

    const faculty = await facultyModels.findById(id).select("firstName lastName");

    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "No faculty found with the given ID",
      });
    }

    res.status(200).send({
      success: true,
      fullName: `${faculty.firstName} ${faculty.lastName}`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching faculty name",
      error: error.message,
    });
  }
};

const Faculty = require("../models/facultyModels");

// Update Faculty by ID
const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findByIdAndUpdate(id, req.body, {
      new: true, // return updated doc
      runValidators: true, // validate schema rules
    });

    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "Faculty not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Faculty updated successfully",
      faculty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating faculty",
      error: error.message,
    });
  }
};

// Delete Faculty by ID
const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findByIdAndDelete(id);

    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "Faculty not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Faculty deleted successfully",
      faculty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting faculty",
      error: error.message,
    });
  }
};

// BULK UPLOAD FROM XLSX
const bulkUploadFaculty = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    // cellDates: true so date columns come through as real JS Dates.
    const workbook = XLSX.readFile(req.file.path, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!data || data.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Excel sheet is empty" });
    }

    const inserted = [];
    const skipped = [];

    for (const row of data) {
      const lookup = buildLookup(row);

      const psrn = cellStr(pick(lookup, ["PSRN"]));
      const fullName = cellStr(pick(lookup, ["Name of the Faculty", "Name", "firstName"]));
      const designation = cellStr(pick(lookup, ["Current Designation", "designation"])) || "Prof.";
      const department = cellStr(pick(lookup, ["Department", "department"])) || "Computer Science";

      // The sheet has two "Email ID" columns (SheetJS disambiguates the
      // second as "Email ID_1"); prefer whichever looks like a real email
      // as the primary login address.
      const emailRaw1 = cellStr(pick(lookup, ["Email ID"])).replace(/,$/, "");
      const emailRaw2 = cellStr(pick(lookup, ["Email ID_1", "Email"])).replace(/,$/, "");
      let email = "", instituteEmail = "";
      if (isValidEmail(emailRaw1)) { email = emailRaw1; instituteEmail = emailRaw2; }
      else if (isValidEmail(emailRaw2)) { email = emailRaw2; instituteEmail = emailRaw1; }
      else { email = emailRaw1 || emailRaw2; instituteEmail = emailRaw1 && emailRaw2 ? emailRaw2 : ""; }

      const mobileNo = cellStr(pick(lookup, ["Mobile No.", "Mobile No", "Mobile"]));
      const chamberNo = cellStr(pick(lookup, ["Chamber No."]));
      const intercomNo = cellStr(pick(lookup, ["Intercom No."]));
      const researchArea = parseListValue(pick(lookup, ["Research Area"]));
      const teaches = parseListValue(pick(lookup, ["Teaches"]));

      const joiningDate = parseFlexibleDate(pick(lookup, ["DOJ", "Joining Date"])) || Date.now();
      const promotedASTPDate = parseFlexibleDate(pick(lookup, ["Promoted as ASTP w.e.f."]));
      const promotedASOPDate = parseFlexibleDate(pick(lookup, ["Promoted as ASOP w.e.f."]));
      const promotedProfessorDate = parseFlexibleDate(pick(lookup, ["Promoted as Professor w.e.f"]));
      const promotedSrProfessorDate = parseFlexibleDate(pick(lookup, ["Promoted as Sr. Professor w.e.f"]));

      const phdScholarsSupervised = parseListValue(
        pick(lookup, ["Name of Ph.D. Scholars Under Supervision"])
      );
      const phdDacMembership = parseListValue(
        pick(lookup, ["Name of PhD Students Under DAC Membership"])
      );

      if (!fullName || !email || !department) {
        skipped.push({
          row: fullName || "(unnamed)",
          reason: "Missing required field (Name, Email, or Department)",
        });
        continue;
      }

      // Split "Firstname Lastname" - everything but the last word is the
      // first name, the last word is the last name. Multi-word surnames
      // and middle names aren't perfectly handled by this heuristic; fix
      // manually via the edit form if needed.
      const nameParts = fullName.split(/\s+/);
      const lastName = nameParts.length > 1 ? nameParts.pop() : nameParts[0];
      const firstName = nameParts.length > 0 ? nameParts.join(" ") : fullName;

      const existingFaculty = await facultyModels.findOne({ email });
      if (existingFaculty) {
        skipped.push({ row: fullName, reason: `Faculty with email "${email}" already exists` });
        continue;
      }

      try {
        const faculty = await facultyModels.create({
          psrn, firstName, lastName, email, instituteEmail, department, designation,
          researchArea, teaches, joiningDate,
          mobileNo, chamberNo, intercomNo,
          promotedASTPDate, promotedASOPDate, promotedProfessorDate, promotedSrProfessorDate,
          phdScholarsSupervised, phdDacMembership,
        });
        inserted.push(faculty);
      } catch (err) {
        skipped.push({ row: fullName, reason: err.message });
      }
    }

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `${inserted.length} faculty records imported successfully${skipped.length ? `, ${skipped.length} skipped` : ""}`,
      faculties: inserted,
      skipped,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error importing file", error: err.message });
  }
};

const Publication = require("../models/publicationModel");
const Conference = require("../models/conferenceModel");

const getFacultyDashboardData = async (req, res) => {
  try {

    const facultyId = req.user._id;
    const facultyName = req.user.name;

    const [publications, conferences] = await Promise.all([
      Publication.find({ authors: facultyId }).sort({ year: -1 }),
      Conference.find({ authors: facultyName })
    ]);

    const groupByYear = (items, field) => {
      return items.reduce((acc, item) => {

        let year = item[field];

        if (field === "date") {
          year = new Date(item.date).getFullYear();
        }

        if (!acc[year]) acc[year] = [];

        acc[year].push(item);

        return acc;

      }, {});
    };

    const dashboardData = {
      Publications: groupByYear(publications, "year"),
      Conferences: groupByYear(conferences, "date"),
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {

    console.error("Dashboard fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error fetching dashboard"
    });

  }
};
module.exports = { 
  addFaculty, 
  getAllFaculty, 
  getFacultyByName, 
  getFacultyIdByName, 
  getFacultyNameById,
  updateFaculty,
  deleteFaculty,
  bulkUploadFaculty,
  getFacultyDashboardData
};