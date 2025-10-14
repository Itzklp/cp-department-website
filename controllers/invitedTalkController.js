const InvitedTalk = require("../models/invitedTalkModel");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

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

// EXPORT FROM EXCEL

exports.bulkUploadTalks = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join(__dirname, "..", req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const inserted = [];

    for (const row of sheetData) {
      const speaker = row["Speaker"]?.trim();
      const title = row["Title"]?.trim();
      const event = row["Event"]?.trim() || "";
      const organizer = row["Organizer"]?.trim() || "";
      const location = row["Location"]?.trim() || "";
      const date = row["Date"]?.trim() || "";
      const mode = row["Mode"]?.trim() || "Online";
      const role = row["Role"]?.trim() || "Speaker";

      if (!speaker || !title) continue; // skip invalid rows

      const talk = new InvitedTalk({
        speaker,
        title,
        event,
        organizer,
        location,
        date,
        mode,
        role,
      });

      await talk.save();
      inserted.push(talk);
    }

    fs.unlinkSync(filePath); // remove uploaded file

    res.status(201).json({
      message: `${inserted.length} invited talks uploaded successfully`,
      talks: inserted,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message });
  }
};