// controllers/conferenceController.js
const Conference = require("../models/conferenceModel");

const XLSX = require("xlsx");
// CREATE
exports.createConference = async (req, res) => {
  try {
    const conference = new Conference(req.body);
    const saved = await conference.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
exports.getConferences = async (req, res) => {
  try {
    const conferences = await Conference.find();
    res.json(conferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getConferenceById = async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id);
    if (!conference) return res.status(404).json({ error: "Conference not found" });
    res.json(conference);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateConference = async (req, res) => {
  try {
    const updated = await Conference.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Conference not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteConference = async (req, res) => {
  try {
    const deleted = await Conference.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Conference not found" });
    res.json({ message: "Conference deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// New Added

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Read Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    // Optional: transform authors if comma-separated
    const formattedData = data.map(row => ({
      ...row,
      authors: row.authors.split(",").map(a => a.trim()),
    }));

    // Insert into MongoDB
    const result = await Conference.insertMany(formattedData);
    res.json({ message: `Imported ${result.length} conferences` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error importing file", error: err.message });
  }
};


