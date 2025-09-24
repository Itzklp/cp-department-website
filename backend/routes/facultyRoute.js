const express = require('express');
const { 
    getAllFaculty, 
    addFaculty, 
    getFacultyByName, 
    getFacultyIdByName, 
    getFacultyNameById,
    updateFaculty,
    deleteFaculty 
} = require('../controllers/facultyController');
const { get } = require('mongoose');

const router = express.Router();

//For Registering a faculty
router.post('/', addFaculty);

//For Getting all faculty details
router.get('/', getAllFaculty);

// Search faculty by partial name (returns full data)
router.get("/search/name", getFacultyByName);

// Get faculty ID by exact firstName + lastName
router.get("/id/by-name", getFacultyIdByName);

// Get faculty name by ID
router.get("/name/by-id/:id", getFacultyNameById);

// Update faculty by ID
router.put("/:id", updateFaculty);

// Delete faculty by ID
router.delete("/:id", deleteFaculty);

module.exports = router;