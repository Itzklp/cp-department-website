// routes/dashboardRoute.js
const express = require('express');
const router = express.Router();
const { getFacultyDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// The frontend calls /api/v1/dashboard/my-dashboard
router.get('/my-dashboard', protect, getFacultyDashboardData);

module.exports = router;