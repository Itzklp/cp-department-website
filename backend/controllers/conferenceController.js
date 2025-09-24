// controllers/conferenceController.js
const Conference = require("../models/conferenceModel");

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
