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

// EXPORT TO EXCEL
exports.bulkUploadTheses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.resolve(req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const inserted = [];

    for (const row of sheetData) {
      const name = row["Name"]?.trim();
      const studentId = row["StudentId"]?.trim();
      const topic = row["Topic"]?.trim();
      const supervisor = row["Supervisor"]?.trim();
      const coSupervisor = row["CoSupervisor"]?.trim() || "";
      const yearAwarded = row["YearAwarded"] ? parseInt(row["YearAwarded"]) : 2024;

      if (!name || !studentId || !topic || !supervisor) continue; // skip invalid rows

      const thesis = new PhDThesis({
        name,
        studentId,
        topic,
        supervisor,
        coSupervisor,
        yearAwarded,
      });

      await thesis.save();
      inserted.push(thesis);
    }

    fs.unlinkSync(filePath); // delete uploaded file

    res.status(201).json({
      message: `${inserted.length} theses uploaded successfully`,
      theses: inserted,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message });
  }
};
