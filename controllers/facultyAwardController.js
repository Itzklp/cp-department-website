const FacultyAward = require("../models/facultyAwardModel");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// CREATE
exports.createAward = async (req, res) => {
  try {
    const award = new FacultyAward(req.body);
    const saved = await award.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
exports.getAllAwards = async (req, res) => {
  try {
    const awards = await FacultyAward.find();
    res.json(awards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getAwardById = async (req, res) => {
  try {
    const award = await FacultyAward.findById(req.params.id);
    if (!award) return res.status(404).json({ error: "Award not found" });
    res.json(award);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateAward = async (req, res) => {
  try {
    const updated = await FacultyAward.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Award not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteAward = async (req, res) => {
  try {
    const deleted = await FacultyAward.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Award not found" });
    res.json({ message: "Award deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// BULK DATA UPLOAD
exports.bulkUploadAwards = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join(__dirname, "..", req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const inserted = [];

    for (const row of sheetData) {
      const facultyName = row["Faculty Name"]?.trim();
      const title = row["Title"]?.trim();
      const organization = row["Organization"]?.trim();
      const journalInfo = row["Journal Info"]?.trim() || "";
      const year = row["Year"] || new Date().getFullYear();
      const category = row["Category"]?.trim() || "Faculty";

      if (!facultyName || !title || !organization) continue; // skip invalid rows

      const award = new FacultyAward({
        facultyName,
        title,
        organization,
        journalInfo,
        year,
        category,
      });

      await award.save();
      inserted.push(award);
    }

    fs.unlinkSync(filePath); // remove uploaded file

    res.status(201).json({
      message: `${inserted.length} faculty awards uploaded successfully`,
      awards: inserted,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message });
  }
};