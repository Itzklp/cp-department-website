const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: false },
    email: { type: String, required: true },
    action: { 
        type: String, 
        enum: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'SSO_LOGIN', 'REGISTER', 'PASSWORD_RESET'], 
        required: true 
    },
    details: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);