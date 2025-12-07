const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide an email and password" });
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('facultyProfile');
  res.status(200).json({ success: true, data: user });
};

// @desc    Update password (Logged in user)
// @route   PUT /api/v1/auth/updatepassword
exports.updatePassword = async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({ success: false, message: "Incorrect current password" });
  }

  user.password = req.body.newPassword;
  user.isFirstLogin = false; // Disable first login flag
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotpassword
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ success: false, message: "There is no user with that email" });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please make a PUT request to: \n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, message: "Email could not be sent" });
  }
};

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid token" });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.isFirstLogin = false;
  
  await user.save();

  sendTokenResponse(user, 200, res);
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      isFirstLogin: user.isFirstLogin,
      role: user.role,
    });
};