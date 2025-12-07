// const express = require('express');
// const { 
//     getAllFaculty, 
//     addFaculty, 
//     getFacultyByName, 
//     getFacultyIdByName, 
//     getFacultyNameById,
//     updateFaculty,
//     deleteFaculty,
//     bulkUploadFaculty
// } = require('../controllers/facultyController');
// const { get } = require('mongoose');

// const router = express.Router();
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// //For Registering a faculty
// router.post('/', addFaculty);

// //For Getting all faculty details
// router.get('/', getAllFaculty);

// // Search faculty by partial name (returns full data)
// router.get("/search/name", getFacultyByName);

// // Get faculty ID by exact firstName + lastName
// router.get("/id/by-name", getFacultyIdByName);

// // Get faculty name by ID
// router.get("/name/by-id/:id", getFacultyNameById);

// // Update faculty by ID
// router.put("/:id", updateFaculty);

// // Delete faculty by ID
// router.delete("/:id", deleteFaculty);

// // Bulk upload faculty via Excel file
// router.post("/bulk-upload", upload.single("file"), bulkUploadFaculty);

// module.exports = router;

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import
const { 
    addFaculty, getAllFaculty, updateFaculty, deleteFaculty 
} = require('../controllers/facultyController');

const router = express.Router();

// Public Routes (if any needed)
router.get('/', getAllFaculty); 

// Protected Routes (Admin Only)
router.post('/', protect, authorize('admin'), addFaculty);
router.put('/:id', protect, authorize('admin'), updateFaculty);
router.delete('/:id', protect, authorize('admin'), deleteFaculty);

module.exports = router;