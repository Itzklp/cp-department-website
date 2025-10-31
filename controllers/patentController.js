const Patent = require("../models/patentModel");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path"); 


// CREATE
exports.createPatent = async (req, res) => {
  try {
    const patent = new Patent(req.body);
    const saved = await patent.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
exports.getAllPatents = async (req, res) => {
  try {
    const patents = await Patent.find();
    res.json(patents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getPatentById = async (req, res) => {
  try {
    const patent = await Patent.findById(req.params.id);
    if (!patent) return res.status(404).json({ error: "Patent not found" });
    res.json(patent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updatePatent = async (req, res) => {
  try {
    const updated = await Patent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Patent not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deletePatent = async (req, res) => {
  try {
    const deleted = await Patent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Patent not found" });
    res.json({ message: "Patent deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// EXPORT USING XLSX
exports.bulkUploadPatents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.resolve(req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const inserted = [];

    for (const row of sheetData) {
      const authorsRaw = row["Authors"]?.trim();
      const title = row["Title"]?.trim();
      const applicationNumber = row["Application Number"]?.trim();
      const filingDate = row["Filing Date"]?.trim();
      const country = row["Country"]?.trim() || "India";
      const status = row["Status"]?.trim() || "Filed";

      if (!authorsRaw || !title || !applicationNumber || !filingDate) continue; // skip invalid rows

      // Split authors by comma or & symbol
      let authors = authorsRaw
        .replace(/&/g, ",") // replace & with comma
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const patent = new Patent({
        authors,
        title,
        applicationNumber,
        filingDate,
        country,
        status,
      });

      await patent.save();
      inserted.push(patent);
    }

    fs.unlinkSync(filePath); // remove uploaded file

    res.status(201).json({
      message: `${inserted.length} patents uploaded successfully`,
      patents: inserted,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message });
  }
};