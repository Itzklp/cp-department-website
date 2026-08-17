const Log = require('../models/logModel');

const getLogs = async (req, res) => {
    try {
        // Fetch logs and attach user details if they exist in the DB
        const logs = await Log.find()
            .sort({ timestamp: -1 })
            .populate('user', 'name role');

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error fetching logs', error: error.message });
    }
};

module.exports = { getLogs };