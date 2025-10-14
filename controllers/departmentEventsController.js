const DepartmentEvent = require("../models/departmentEventsModel");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");


// Add new event
const addDepartmentEvent = async (req, res) => {
  try {
    const event = new DepartmentEvent(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all events OR filter by type (query param)
const getDepartmentEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const events = type
      ? await DepartmentEvent.find({ type })
      : await DepartmentEvent.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get event by ID
const getDepartmentEventById = async (req, res) => {
  try {
    const event = await DepartmentEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search events by title
const searchDepartmentEventsByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ message: "Title query is required" });
    }
    const events = await DepartmentEvent.find({
      title: new RegExp(title, "i"),
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update event by ID
const updateDepartmentEvent = async (req, res) => {
  try {
    const event = await DepartmentEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete event by ID
const deleteDepartmentEvent = async (req, res) => {
  try {
    const event = await DepartmentEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk data upload
const bulkUploadDepartmentEvents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = path.join(__dirname, "..", req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const inserted = [];

    for (const row of sheetData) {
      const title = row["Title"]?.trim();
      const type = row["Type"]?.trim() || "Event";
      const description = row["Description"]?.trim() || "";
      const dateStr = row["Date"]?.trim();
      const organizedBy = row["OrganizedBy"]?.trim() || "Department";

      if (!title || !dateStr) continue; // skip invalid rows

      const date = new Date(dateStr);
      if (isNaN(date)) continue; // skip invalid date

      const event = new DepartmentEvent({
        title,
        type,
        description,
        date,
        organizedBy,
      });

      await event.save();
      inserted.push(event);
    }

    fs.unlinkSync(filePath); // remove uploaded file

    res.status(201).json({
      message: `${inserted.length} events uploaded successfully`,
      events: inserted,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addDepartmentEvent,
  getDepartmentEvents,
  getDepartmentEventById,
  searchDepartmentEventsByTitle,
  updateDepartmentEvent,
  deleteDepartmentEvent,
  bulkUploadDepartmentEvents,
};
