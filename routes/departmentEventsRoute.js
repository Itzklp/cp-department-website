const express = require("express");
const {
  addDepartmentEvent,
  getDepartmentEvents,
  getDepartmentEventById,
  searchDepartmentEventsByTitle,
  updateDepartmentEvent,
  deleteDepartmentEvent,
  bulkUploadDepartmentEvents
} = require("../controllers/departmentEventsController");

const departmentEventsController = require("../controllers/departmentEventsController");

const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

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

// Bulk data upload
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    } else {
      cb(new Error("Only XLSX files are allowed!"), false);
    }
  } 
});

router.post("/bulk", upload.single("file"), departmentEventsController.bulkUploadDepartmentEvents);

module.exports = router;
