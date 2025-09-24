const express = require("express");
const {
  addDepartmentEvent,
  getDepartmentEvents,
  getDepartmentEventById,
  searchDepartmentEventsByTitle,
  updateDepartmentEvent,
  deleteDepartmentEvent,
} = require("../controllers/departmentEventsController");

const router = express.Router();

// Add new event
router.post("/", addDepartmentEvent);

// Get all events OR filter by type (query param)
router.get("/", getDepartmentEvents);

// Get event by ID
router.get("/:id", getDepartmentEventById);

// Search events by title
router.get("/search/title", searchDepartmentEventsByTitle);

// Update event by ID
router.put("/:id", updateDepartmentEvent);

// Delete event by ID
router.delete("/:id", deleteDepartmentEvent);

module.exports = router;
