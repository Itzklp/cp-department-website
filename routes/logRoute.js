const express = require('express');
const { getLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Only logged in users who are 'admin' can get here
router.get('/', protect, authorize('admin'), getLogs);

module.exports = router;