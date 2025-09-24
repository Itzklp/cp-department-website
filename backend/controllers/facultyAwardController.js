const FacultyAward = require("../models/facultyAwardModel");

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
