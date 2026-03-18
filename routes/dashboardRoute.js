// routes/dashboardRoute.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getFacultyDashboardData } = require('../controllers/dashboardController');

const router = express.Router();

// Fetch dashboard data for the logged-in user
router.get('/my-dashboard', protect, getFacultyDashboardData);

module.exports = router;