// routes/adminRoute.js
const express = require("express");
const { getUsers, toggleStatus, changeRole, deleteUser } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require user to be logged in AND have the "admin" role
router.use(protect);
router.use(authorize("admin"));

router.get("/users", getUsers);
router.patch("/users/:id/status", toggleStatus);
router.patch("/users/:id/role", changeRole);
router.delete("/users/:id", deleteUser);

module.exports = router;