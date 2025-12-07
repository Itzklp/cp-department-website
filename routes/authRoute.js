const express = require("express");
const { 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updatePassword 
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatepassword", protect, updatePassword);
router.get("/me", protect, getMe);

module.exports = router;