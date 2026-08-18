const PhDThesis = require("../models/phdThesisModel");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// CREATE
exports.createThesis = async (req, res) => {
  try {
    const thesis = new PhDThesis(req.body);
    const saved = await thesis.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
exports.getAllTheses = async (req, res) => {
  try {
    const theses = await PhDThesis.find();
    res.json(theses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getThesisById = async (req, res) => {
  try {
    const thesis = await PhDThesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ error: "Thesis not found" });
    res.json(thesis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateThesis = async (req, res) => {
  try {
    const updated = await PhDThesis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Thesis not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteThesis = async (req, res) => {
  try {
    const deleted = await PhDThesis.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Thesis not found" });
    res.json({ message: "Thesis deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helpers for bulk upload parsing
const cellStr = (val) => {
  if (val === undefined || val === null) return "";
  return String(val).trim();
};

// Excel headers can contain \n, \r\n, or extra spaces (line-wrapped headers
// like "Date \n(1st attempt of QE)"). Normalize so lookups are resilient to that.
const normalizeKey = (k) => k.replace(/\s+/g, "").trim().toLowerCase();

const buildLookup = (row) => {
  const map = {};
  for (const key of Object.keys(row)) {
    map[normalizeKey(key)] = row[key];
  }
  return map;
};

// First non-empty value across a list of possible header spellings
const pick = (lookup, keys) => {
  for (const k of keys) {
    const v = lookup[normalizeKey(k)];
    if (v !== undefined && v !== null && cellStr(v) !== "") return v;
  }
  return undefined;
};

const parseDate = (val) => {
  if (val === undefined || val === null || cellStr(val) === "") return null;
  const d = val instanceof Date ? val : new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// Splits a generic multi-value cell (e.g. comma/semicolon separated names)
// into a clean array.
const parseMultiValue = (val) => {
  if (val === undefined || val === null) return [];
  return String(val)
    .split(/\r?\n|,|;|&/)
    .map((s) => s.replace(/^\s*\d+[.)]\s*/, "").trim()) // strip leading "1." / "2)" numbering
    .filter((s) => s.length > 0 && s.toLowerCase() !== "none");
};

// "Source of Stipend" cells look like:
//   "1. Sponsored Project\n       * Name of Project\n2. Institute Fellowship"
// The "* Name of Project" line is a sub-label for filling in a project name,
// not a stipend source itself - so it needs its own parser rather than the
// generic one above.
const parseSourceOfStipend = (val) => {
  if (val === undefined || val === null || cellStr(val) === "") {
    return { sources: [], projectName: "" };
  }
  const lines = String(val)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sources = [];
  let projectName = "";

  for (const line of lines) {
    const bulletMatch = line.match(/^\*\s*(.+)$/);
    if (bulletMatch) {
      const projMatch = bulletMatch[1].match(/name of project\s*[:\-]?\s*(.*)/i);
      if (projMatch) {
        if (projMatch[1].trim()) projectName = projMatch[1].trim();
        continue; // label line, not a stipend source
      }
      continue;
    }

    const numberedMatch = line.match(/^\d+[.)]\s*(.+)$/);
    const text = (numberedMatch ? numberedMatch[1] : line).trim();
    if (text && text.toLowerCase() !== "none") {
      text.split(/,|;|&/).map((s) => s.trim()).filter(Boolean).forEach((s) => sources.push(s));
    }
  }

  return { sources: [...new Set(sources)], projectName };
};

// EXPORT TO EXCEL
exports.bulkUploadTheses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.resolve(req.file.path);
    // cellDates: true so date columns come through as real JS Dates
    // instead of raw Excel serial numbers.
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    const inserted = [];
    const skipped = [];

    for (const row of sheetData) {
      const lookup = buildLookup(row);

      const scholarName = cellStr(pick(lookup, ["Name", "Scholar Name"]));
      const studentId = cellStr(pick(lookup, ["ID No", "StudentId", "Student Id"]));
      const designation = cellStr(pick(lookup, ["Desig", "Designation"]));
      const mobileNo = cellStr(pick(lookup, ["Mobile No", "Mobile"]));
      const labNo = cellStr(pick(lookup, ["LAB No.", "LAB No", "Lab No"]));
      const intercomNo = cellStr(pick(lookup, ["Intercom No.", "Intercom No"]));
      const supervisor = cellStr(pick(lookup, ["Supervisor"]));
      const dacMember1 = cellStr(pick(lookup, ["DAC Member1", "DAC Member 1"]));
      const dacMember2 = cellStr(pick(lookup, ["DAC Member2", "DAC Member 2"]));
      const thesisTitle = cellStr(
        pick(lookup, ["Proposed Topic of Research", "Thesis Title", "Topic"])
      );
      const remarks = cellStr(pick(lookup, ["Remarks (if any)", "Remarks"]));

      const year = row["Year"] ? parseInt(row["Year"]) : new Date().getFullYear();
      const status = cellStr(pick(lookup, ["Status"])) || "Ongoing";
      const fellowshipProgram =
        cellStr(pick(lookup, ["Fellowship Program"])) || "Institute Fellow";

      const sourceOfStipendRaw = pick(lookup, ["Source of Stipend"]);
      const { sources: sourceOfStipend, projectName: sponsoredProjectName } =
        parseSourceOfStipend(sourceOfStipendRaw);

      const coSupervisor = parseMultiValue(
        pick(lookup, ["Co-Supervisor(s)", "CoSupervisor", "Co-Supervisor"])
      );

      if (!scholarName || !thesisTitle || !supervisor) {
        skipped.push({
          row: scholarName || "(unnamed)",
          reason: "Missing required field (Name, Proposed Topic of Research, or Supervisor)",
        });
        continue;
      }

      const thesis = new PhDThesis({
        scholarName,
        studentId,
        designation,
        sourceOfStipend,
        sponsoredProjectName,
        mobileNo,
        labNo,
        intercomNo,
        thesisTitle,
        supervisor,
        coSupervisor,
        dacMember1,
        dacMember2,
        year,
        status,
        fellowshipProgram,
        remarks,
        dateOfJoining: parseDate(pick(lookup, ["DOJ", "Date of Joining"])),
        instituteFellowshipStartDate: parseDate(
          pick(lookup, ["Institute Fellowship Started W.E.F"])
        ),
        instituteStipendEndDate: parseDate(pick(lookup, ["Inst Stipend Ended on"])),
        qeAttempt1Date: parseDate(pick(lookup, ["Date (1st attempt of QE)"])),
        qeAttempt2Date: parseDate(
          pick(lookup, ["Date (2nd attempt of QE (if any))", "Date (2nd attempt of QE (if any)"])
        ),
        dateOfPhdQualified: parseDate(pick(lookup, ["Qualifying Passed on", "Date Qualified"])),
        dateOfProposal: parseDate(
          pick(lookup, ["Date of Proposal Presentation", "Date of Proposal"])
        ),
        proposalApprovedDate: parseDate(pick(lookup, ["Proposal Approved on"])),
        dateOfPreSubmission: parseDate(
          pick(lookup, ["Date of Pre Sumission Seminar", "Date of Pre Submission Seminar", "Pre-Submission"])
        ),
        dateOfThesisSubmission: parseDate(pick(lookup, ["Thesis Submission"])),
        dateOfVivaVoce: parseDate(pick(lookup, ["Date of Viva Voce Exam", "Viva Voce"])),
      });

      await thesis.save();
      inserted.push(thesis);
    }

    fs.unlinkSync(filePath);

    res.status(201).json({
      message: `${inserted.length} theses uploaded successfully${skipped.length ? `, ${skipped.length} skipped` : ""}`,
      theses: inserted,
      skipped,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message });
  }
};