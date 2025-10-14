const Project = require("../models/projectsModel");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

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

//Bulk upload projects from Excel file
const bulkUploadProjects = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const filePath = path.join(__dirname, "..", req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const inserted = [];

    for (const row of sheetData) {
      // Extract data from Excel row
      const projectTitle = row["Project Title"]?.trim();
      const piName = row["PI"]?.trim();
      const coPiName = row["Co-PI"]?.trim();
      const collaborator = row["Collaborator"]?.trim() || "";
      const fundingAgency = row["Funding Agency"]?.trim();
      const dateSanctioned = row["Date Sanctioned"] ? new Date(row["Date Sanctioned"]) : null;
      const dateCompletion = row["Date Completion"] ? new Date(row["Date Completion"]) : null;
      const status = row["Status"]?.trim();
      const notableAchievements = row["Notable Achievements"] ? row["Notable Achievements"].split(";").map(a => a.trim()) : [];
      const sanctionLetterLink = row["Sanction Letter Link"]?.trim() || "";
      const totalINR = row["Total INR"] ? Number(row["Total INR"]) : null;
      const type = row["Type"]?.trim(); // National / International
      const category = row["Category"]?.trim(); // Government / Industry

      if (!projectTitle || !piName || !fundingAgency || !dateSanctioned || !dateCompletion || !status || !totalINR || !type || !category) {
        continue; // skip invalid row
      }

      // Lookup PI and Co-PI in Faculty collection
      const projectPI = await Faculty.findOne({
        $or: [
          { fullName: { $regex: new RegExp(`^${piName}$`, "i") } },
          { $expr: { $regexMatch: { input: { $concat: ["$firstName"," ","$lastName"] }, regex: new RegExp(`^${piName}$`, "i") } } }
        ]
      });

      const projectCoPI = coPiName
        ? await Faculty.findOne({
            $or: [
              { fullName: { $regex: new RegExp(`^${coPiName}$`, "i") } },
              { $expr: { $regexMatch: { input: { $concat: ["$firstName"," ","$lastName"] }, regex: new RegExp(`^${coPiName}$`, "i") } } }
            ]
          })
        : null;

      const project = new Project({
        projectTitle,
        projectPI: projectPI ? projectPI._id : null,
        projectCoPI: projectCoPI ? projectCoPI._id : null,
        collaborator,
        fundingAgency,
        dateSanctioned,
        dateCompletion,
        status,
        notableAchievements,
        sanctionLetterLink,
        totalINR,
        type,
        category,
      });

      await project.save();
      inserted.push(project);
    }

    fs.unlinkSync(filePath);

    res.status(201).json({
      success: true,
      message: `${inserted.length} projects uploaded successfully`,
      projects: inserted,
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createProject, getAllProjects, updateProject, deleteProject, getProjectsByFacultyId, bulkUploadProjects };
