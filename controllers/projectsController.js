const Project = require("../models/projectsModel");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const Faculty = require("../models/facultyModels");

// ---- Helpers for bulk upload parsing ----
const cellStr = (val) => (val === undefined || val === null) ? "" : String(val).trim();

// Excel headers can carry \n/\r\n or extra spaces (even mid-word, e.g.
// "Type of Project\r\n(Consultancy\r\n/Sponsored)") - strip ALL whitespace
// before matching so line-wrapped headers match reliably.
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

// Handles real Date objects, ISO strings, and "D.M.YYYY" / "DD.MM.YYYY"
// (the format this department's sheets actually use, e.g. "31.3.2025").
const parseFlexibleDate = (val) => {
  if (val === undefined || val === null || cellStr(val) === "") return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  const str = String(val).trim();
  const dotMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const normalizeCategory = (val) => {
  const v = cellStr(val);
  const map = { government: "Govt", govt: "Govt", industry: "Industry", international: "International" };
  return map[v.toLowerCase()] || v;
};

const normalizeType = (val) => {
  const v = cellStr(val);
  const map = { consultancy: "Consultancy", sponsored: "Sponsored" };
  return map[v.toLowerCase()] || v;
};

// Create a new project
const createProject = async (req, res) => {
  try {
    // AUTHORIZATION CHECK
    // If not admin, ensure the user is assigning themselves as PI or Co-PI
    if (req.user.role !== 'admin') {
        const userFacultyId = req.user.facultyProfile ? req.user.facultyProfile.toString() : null;
        const piId = req.body.projectPI;
        const coPiId = req.body.projectCoPI;

        if (!userFacultyId) {
             return res.status(400).send({ success: false, message: "User is not linked to a faculty profile." });
        }

        // Check if the logged-in user is either the PI or the Co-PI
        if (piId !== userFacultyId && coPiId !== userFacultyId) {
            return res.status(403).send({ 
                success: false, 
                message: "Authorization Failed: You can only add projects where you are the PI or Co-PI." 
            });
        }
    }

    const project = await Project.create(req.body);
    res.status(201).send({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
};

// Get all projects with PI & Co-PI populated
const getAllProjects = async (req, res) => {
  try {
    let query = {};

    // If NOT admin, force filter to show only user's projects
    if (req.user.role !== 'admin') {
        if (!req.user.facultyProfile) {
            return res.status(200).send({ success: true, count: 0, projects: [] });
        }
        query = {
            $or: [
                { projectPI: req.user.facultyProfile },
                { projectCoPI: req.user.facultyProfile }
            ]
        };
    }

    const projects = await Project.find(query)
      .populate("projectPI", "firstName lastName email")
      .populate("projectCoPI", "firstName lastName email");

    res.status(200).send({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

// Update project by ID
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingProject = await Project.findById(id);

    if (!existingProject) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    // AUTHORIZATION CHECK
    if (req.user.role !== 'admin') {
        const userFacultyId = req.user.facultyProfile ? req.user.facultyProfile.toString() : null;
        
        const isPI = existingProject.projectPI && existingProject.projectPI.toString() === userFacultyId;
        const isCoPI = existingProject.projectCoPI && existingProject.projectCoPI.toString() === userFacultyId;

        if (!isPI && !isCoPI) {
            return res.status(403).send({ 
                success: false, 
                message: "Authorization Failed: You can only update your own projects." 
            });
        }
    }

    const project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("projectPI", "firstName lastName email")
      .populate("projectCoPI", "firstName lastName email");

    res.status(200).send({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
};

// Delete project by ID
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProject = await Project.findById(id);

    if (!existingProject) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    // AUTHORIZATION CHECK
    if (req.user.role !== 'admin') {
        const userFacultyId = req.user.facultyProfile ? req.user.facultyProfile.toString() : null;
        
        const isPI = existingProject.projectPI && existingProject.projectPI.toString() === userFacultyId;
        const isCoPI = existingProject.projectCoPI && existingProject.projectCoPI.toString() === userFacultyId;

        if (!isPI && !isCoPI) {
            return res.status(403).send({ 
                success: false, 
                message: "Authorization Failed: You can only delete your own projects." 
            });
        }
    }

    await Project.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  }
};

// Get projects by Faculty ID
const getProjectsByFacultyId = async (req, res) => {
  try {
    const { facultyId } = req.params;

    // AUTHORIZATION CHECK
    if (req.user.role !== 'admin') {
        const userFacultyId = req.user.facultyProfile ? req.user.facultyProfile.toString() : null;
        if (facultyId !== userFacultyId) {
             return res.status(403).send({ 
                success: false, 
                message: "Authorization Failed: You cannot view projects of other faculty members." 
            });
        }
    }

    const projects = await Project.find({
      $or: [{ projectPI: facultyId }, { projectCoPI: facultyId }],
    })
      .populate("projectPI", "firstName lastName email")
      .populate("projectCoPI", "firstName lastName email");

    if (!projects || projects.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No projects found for this faculty",
      });
    }

    res.status(200).send({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching projects by faculty ID",
      error: error.message,
    });
  }
};

// Bulk upload projects from Excel file
const bulkUploadProjects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    const inserted = [];
    const skipped = [];

    for (const row of sheetData) {
      const lookup = buildLookup(row);

      const psrn = cellStr(pick(lookup, ["PSRN"]));
      const projectTitle = cellStr(pick(lookup, ["Project Title"]));
      const piName = cellStr(pick(lookup, ["Principal Investigator (PI)", "PI"]));
      const coPiName = cellStr(pick(lookup, ["Co-PI"]));
      const collaborator = cellStr(pick(lookup, ["Collaborator"]));
      const fundingAgency = cellStr(pick(lookup, ["Agency", "Funding Agency"]));
      const scheme = cellStr(pick(lookup, ["Scheme"]));
      const dateSanctioned = parseFlexibleDate(pick(lookup, ["Sanctioned Date", "Date Sanctioned"]));
      const projectStartDate = parseFlexibleDate(pick(lookup, ["Project Start Date"]));
      const dateCompletion = parseFlexibleDate(pick(lookup, ["Project End Date", "Date Completion"]));
      const status = cellStr(pick(lookup, ["Status"]));
      const notableAchievements = pick(lookup, ["Notable Achievements"])
        ? String(pick(lookup, ["Notable Achievements"])).split(";").map((a) => a.trim()).filter(Boolean)
        : [];
      const sanctionLetterLink = cellStr(pick(lookup, ["Sanction Letter Link"]));

      const totalINRRaw = pick(lookup, ["Amount Sanctioned (Rs)", "Total INR"]);
      const totalINR = totalINRRaw !== undefined && cellStr(totalINRRaw) !== "" ? Number(totalINRRaw) : null;

      const type = normalizeType(pick(lookup, ["Type of Project (Consultancy/Sponsored)", "Type"]));
      const category = normalizeCategory(
        pick(lookup, ["Type of Project (Govt/Industry/International)", "Category"])
      );

      // Skip invalid rows, with a reason so the admin can see what to fix
      const missing = [];
      if (!projectTitle) missing.push("Project Title");
      if (!piName) missing.push("Principal Investigator (PI)");
      if (!fundingAgency) missing.push("Agency");
      if (!dateSanctioned) missing.push("Sanctioned Date");
      if (!dateCompletion) missing.push("Project End Date");
      if (!status) missing.push("Status");
      if (totalINR === null || isNaN(totalINR)) missing.push("Amount Sanctioned (Rs)");
      if (!type) missing.push("Type of Project (Consultancy/Sponsored)");
      if (!category) missing.push("Type of Project (Govt/Industry/International)");

      if (missing.length > 0) {
        skipped.push({ row: projectTitle || "(untitled)", reason: `Missing: ${missing.join(", ")}` });
        continue;
      }

      // Lookup PI and Co-PI in Faculty collection
      const projectPI = await Faculty.findOne({
        $or: [
          { fullName: { $regex: new RegExp(`^${piName}$`, "i") } },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: new RegExp(`^${piName}$`, "i"),
              },
            },
          },
        ],
      });

      if (!projectPI) {
        skipped.push({ row: projectTitle, reason: `Principal Investigator "${piName}" not found in Faculty records` });
        continue;
      }

      const projectCoPI = coPiName
        ? await Faculty.findOne({
            $or: [
              { fullName: { $regex: new RegExp(`^${coPiName}$`, "i") } },
              {
                $expr: {
                  $regexMatch: {
                    input: { $concat: ["$firstName", " ", "$lastName"] },
                    regex: new RegExp(`^${coPiName}$`, "i"),
                  },
                },
              },
            ],
          })
        : null;

      const project = new Project({
        psrn,
        projectTitle,
        projectPI: projectPI._id,
        projectCoPI: projectCoPI ? projectCoPI._id : null,
        collaborator,
        fundingAgency,
        scheme,
        dateSanctioned,
        projectStartDate,
        dateCompletion,
        status,
        notableAchievements,
        sanctionLetterLink,
        totalINR,
        type,
        category,
      });

      await project.save();
      inserted.push(project);
    }

    // Clean up temp file after upload
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `${inserted.length} projects uploaded successfully${skipped.length ? `, ${skipped.length} skipped` : ""}`,
      projects: inserted,
      skipped,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
    createProject, 
    getAllProjects, 
    updateProject, 
    deleteProject, 
    getProjectsByFacultyId, 
    bulkUploadProjects 
};