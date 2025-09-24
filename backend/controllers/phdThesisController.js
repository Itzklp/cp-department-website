const PhDThesis = require("../models/phdThesisModel");

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
