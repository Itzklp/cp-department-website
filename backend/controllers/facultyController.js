const colors = require("colors");
const facultyModels = require("../models/facultyModels");

// Add Faculty
const addFaculty = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      department, 
      researchArea, 
      teaches, 
      joiningDate,
      designation
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !department) {
      return res.status(400).send({
        success: false,
        message: "Please provide firstName, lastName, email, and department",
      });
    }

    // Check if faculty already exists
    const existingFaculty = await facultyModels.findOne({ email });
    if (existingFaculty) {
      return res.status(400).send({
        success: false,
        message: "Faculty already exists",
      });
    }

    // Create faculty entry
    const faculty = await facultyModels.create({
      firstName,
      lastName,
      email,
      department,
      designation: designation || "Prof.", // fallback to default
      researchArea: Array.isArray(researchArea) ? researchArea : (researchArea ? [researchArea] : []),
      teaches: Array.isArray(teaches) ? teaches : (teaches ? [teaches] : []),
      joiningDate: joiningDate || Date.now(),
    });

    res.status(201).send({
      success: true,
      message: "Faculty registered successfully",
      faculty,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in facultyController",
      error: error.message,
    });
  }
};

// Get all faculties
const getAllFaculty = async (req, res) => {
  try {
    const faculties = await facultyModels.find({});
    res.status(200).send({
      success: true,
      message: "Faculties fetched successfully",
      count: faculties.length,
      faculties,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error while fetching faculty",
      error: error.message.red.bold,
    });
  }
};

// Search faculty by name (firstName or lastName)
const getFacultyByName = async (req, res) => {
  try {
    const { name } = req.query; // single query param: ?name=Ka

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please provide a search term (name)",
      });
    }

    // Case-insensitive partial match on both firstName & lastName
    const faculty = await facultyModels.find({
      $or: [
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } }
      ],
    });

    if (!faculty || faculty.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No faculty found matching the search term",
      });
    }

    res.status(200).send({
      success: true,
      count: faculty.length,
      faculty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while searching faculty",
      error: error.message,
    });
  }
};

// Get faculty ID by exact firstName + lastName
const getFacultyIdByName = async (req, res) => {
  try {
    const { firstName, lastName } = req.query;

    if (!firstName || !lastName) {
      return res.status(400).send({
        success: false,
        message: "Please provide both firstName and lastName",
      });
    }

    const faculty = await facultyModels
      .findOne({
        firstName: { $regex: `^${firstName}$`, $options: "i" }, // exact match but case-insensitive
        lastName: { $regex: `^${lastName}$`, $options: "i" },
      })
      .select("_id"); // only fetch _id field

    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "No faculty found with the given firstName and lastName",
      });
    }

    res.status(200).send({
      success: true,
      facultyId: faculty._id, // only ID returned
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching faculty ID",
      error: error.message,
    });
  }
};

// Get faculty name by ID
const getFacultyNameById = async (req, res) => {
  try {
    const { id } = req.params; // expecting /name/by-id/:id

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Please provide faculty ID",
      });
    }

    const faculty = await facultyModels.findById(id).select("firstName lastName");

    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "No faculty found with the given ID",
      });
    }

    res.status(200).send({
      success: true,
      fullName: `${faculty.firstName} ${faculty.lastName}`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while fetching faculty name",
      error: error.message,
    });
  }
};

const Faculty = require("../models/facultyModels");

// Update Faculty by ID
const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findByIdAndUpdate(id, req.body, {
      new: true, // return updated doc
      runValidators: true, // validate schema rules
    });

    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "Faculty not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Faculty updated successfully",
      faculty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating faculty",
      error: error.message,
    });
  }
};

// Delete Faculty by ID
const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findByIdAndDelete(id);

    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "Faculty not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Faculty deleted successfully",
      faculty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting faculty",
      error: error.message,
    });
  }
};


module.exports = { 
  addFaculty, 
  getAllFaculty, 
  getFacultyByName, 
  getFacultyIdByName, 
  getFacultyNameById,
  updateFaculty,
  deleteFaculty 
};
