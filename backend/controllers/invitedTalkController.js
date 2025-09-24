const InvitedTalk = require("../models/invitedTalkModel");

// CREATE
exports.createTalk = async (req, res) => {
  try {
    const talk = new InvitedTalk(req.body);
    const saved = await talk.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
exports.getAllTalks = async (req, res) => {
  try {
    const talks = await InvitedTalk.find();
    res.json(talks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getTalkById = async (req, res) => {
  try {
    const talk = await InvitedTalk.findById(req.params.id);
    if (!talk) return res.status(404).json({ error: "Invited talk not found" });
    res.json(talk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateTalk = async (req, res) => {
  try {
    const updated = await InvitedTalk.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Invited talk not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteTalk = async (req, res) => {
  try {
    const deleted = await InvitedTalk.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Invited talk not found" });
    res.json({ message: "Invited talk deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
