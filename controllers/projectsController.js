const Project = require("../models/projectsModel");

// Create a new project
const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).send({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
};

// Get all projects with PI & Co-PI populated
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate("projectPI", "firstName lastName email") // populate faculty info
      .populate("projectCoPI", "firstName lastName email");

    res.status(200).send({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

// Update project by ID
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("projectPI", "firstName lastName email")
      .populate("projectCoPI", "firstName lastName email");

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
};

// Delete project by ID
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  }
};

// Get projects by Faculty ID (PI or Co-PI)
const getProjectsByFacultyId = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const projects = await Project.find({
      $or: [{ projectPI: facultyId }, { projectCoPI: facultyId }],
    })
      .populate("projectPI", "firstName lastName email")
      .populate("projectCoPI", "firstName lastName email");

    if (!projects || projects.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No projects found for this faculty",
      });
    }

    res.status(200).send({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching projects by faculty ID",
      error: error.message,
    });
  }
};

module.exports = { createProject, getAllProjects, updateProject, deleteProject, getProjectsByFacultyId };
