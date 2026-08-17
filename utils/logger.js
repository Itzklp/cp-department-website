const Log = require('../models/logModel');

const logActivity = async (email, action, details, ipAddress = 'System', userId = null) => {
    try {
        await Log.create({ 
            user: userId, 
            email, 
            action, 
            details, 
            ipAddress 
        });
    } catch (error) {
        console.error('System Logging failed:', error);
    }
};

module.exports = logActivity;