const express = require("express");
const {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  getProjectsByFacultyId,
  bulkUploadProjects
} = require("../controllers/projectsController");
const { protect, authorize } = require("../middleware/authMiddleware"); // Import middleware

const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Apply 'protect' to ALL routes in this file
// This ensures that req.user is always available in the controller
router.use(protect);

// Create project
router.post("/add", createProject);

// Get all projects (Controller filters this based on user role)
router.get("/", getAllProjects);

// Update project by ID
router.put("/:id", updateProject);

// Delete project by ID
router.delete("/:id", deleteProject);

// Get projects by Faculty ID
router.get("/faculty/:facultyId", getProjectsByFacultyId);

// Bulk upload projects via CSV
// RESTRICTED: Only Admins can perform bulk uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
  },
});

router.post("/bulk", authorize("admin"), upload.single("file"), bulkUploadProjects);

module.exports = router;