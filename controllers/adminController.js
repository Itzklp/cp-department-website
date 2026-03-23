// controllers/adminController.js
const User = require("../models/userModel");
const Faculty = require("../models/facultyModels");

// @desc    Get all active users
// @route   GET /api/v1/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } })
      .populate("facultyProfile", "firstName lastName designation department")
      .select("-password");

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle User Status (Suspend/Resume)
// @route   PATCH /api/v1/admin/users/:id/status
exports.toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await user.save();

    res.status(200).json({ success: true, message: `User is now ${user.status}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change User Role
// @route   PATCH /api/v1/admin/users/:id/role
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body; // Expecting 'admin', 'faculty', or 'hod'
    const validRoles = ["admin", "faculty", "hod"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    // Optional: Sync HOD designation in Faculty Profile
    if (user.facultyProfile) {
      const designation = role === "hod" ? "Head of Department" : "Prof.";
      await Faculty.findByIdAndUpdate(user.facultyProfile, { designation });
    }

    res.status(200).json({ success: true, message: `Role updated to ${role}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft Delete User
// @route   DELETE /api/v1/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // SOFT DELETE: Mark as deleted, scramble password so they can never login
    user.isDeleted = true;
    user.status = "SUSPENDED"; 
    user.password = "DELETED_USER_NOLOGIN"; 
    await user.save();

    // Notice we DO NOT delete the linked `Faculty` document! Data is preserved.

    res.status(200).json({ success: true, message: "User access permanently removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};