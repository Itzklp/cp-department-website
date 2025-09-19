const Patent = require("../models/patentModel");

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
