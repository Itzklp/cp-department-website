const express = require("express");
const {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  getProjectsByFacultyId,
  bulkUploadProjects
} = require("../controllers/projectsController");

const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Create project
router.post("/add", createProject);

// Get all projects
router.get("/", getAllProjects);

// Update project by ID
router.put("/:id", updateProject);

// Delete project by ID
router.delete("/:id", deleteProject);

// Get projects by Faculty ID
router.get("/faculty/:facultyId", getProjectsByFacultyId);

// Bulk upload projects via CSV
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

router.post("/bulk", upload.single("file"), bulkUploadProjects);

module.exports = router;
