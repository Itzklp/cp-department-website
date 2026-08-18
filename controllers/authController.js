const User = require('../models/userModel');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/logger');

// Initialize Google Client for SSO
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
// HELPER: Generate Token & Send Response
// ==========================================
const sendTokenResponse = (user, statusCode, res) => {
    // Generate JWT token
    const token = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFirstLogin: user.isFirstLogin
        }
    });
};

// ==========================================
// GOOGLE SSO LOGIN (Strict Mode)
// ==========================================
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ success: false, message: "No Google token provided" });
    }

    // 1. Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const userEmail = payload.email;

    // 2. STRICT CHECK: Does this email exist in our DB?
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      // LOG FAILED SSO ATTEMPT
      await logActivity(userEmail, 'LOGIN_FAILED', 'SSO Denied: Email not registered in DB', req.ip);

      // Reject login: Do NOT create a new user document
      return res.status(403).json({
        success: false,
        message: "Access Denied. Your email is not registered in the CISIS portal. Please contact the administrator to be added."
      });
    }

    // LOG SUCCESSFUL SSO
    await logActivity(user.email, 'SSO_LOGIN', 'User successfully logged in via Google SSO', req.ip, user._id);

    // 3. SUCCESS: User exists. Generate your portal's JWT token and log them in
    sendTokenResponse(user, 200, res); 

  } catch (error) {
    console.error("Google SSO Error:", error);
    await logActivity('Unknown', 'LOGIN_FAILED', 'Invalid Google Token provided or verification failed', req.ip);
    res.status(401).json({ success: false, message: "Invalid Google Token or SSO failed." });
  }
};

// ==========================================
// MANUAL EMAIL/PASSWORD LOGIN
// ==========================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        // Check for user
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            await logActivity(email, 'LOGIN_FAILED', 'Attempted manual login with unregistered email', req.ip);
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            await logActivity(email, 'LOGIN_FAILED', 'Incorrect password provided', req.ip, user._id);
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        await logActivity(email, 'LOGIN_SUCCESS', 'User successfully logged in manually', req.ip, user._id);
        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// GET LOGGED IN USER (GET /me)
// ==========================================
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id || req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// FORGOT PASSWORD
// ==========================================
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: "There is no user with that email" });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset url
        const clientUrl = process.env.CLIENT_URL || "http://172.24.16.207";
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please Click on: \n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

            await logActivity(user.email, 'PASSWORD_RESET', 'Password reset email requested and sent', req.ip, user._id);
            res.status(200).json({ success: true, data: "Email sent" });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: "Email could not be sent" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// RESET PASSWORD
// ==========================================
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        await logActivity(user.email, 'PASSWORD_RESET', 'Password successfully reset via email token', req.ip, user._id);
        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// UPDATE PASSWORD
// ==========================================
const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id || req.user._id).select("+password");

        // Check if current password matches
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        // Set the new password and clear the first login flag
        user.password = req.body.newPassword;
        user.isFirstLogin = false; 
        
        await user.save();

        await logActivity(user.email, 'PASSWORD_RESET', 'Password updated successfully from internal dashboard', req.ip, user._id);
        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    login,
    googleLogin,
    getMe,
    forgotPassword,
    resetPassword,
    updatePassword
};
