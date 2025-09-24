const express = require("express");
const {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  getProjectsByFacultyId
} = require("../controllers/projectsController");

const router = express.Router();

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

module.exports = router;
