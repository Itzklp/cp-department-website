const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const departmentTalkController = require("../controllers/departmentTalkController");

// Bulk data upload
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    } else {
      cb(new Error("Only XLSX files are allowed!"), false);
    }
  },
});

// Add department talks
router.post("/", departmentTalkController.createTalk);

// Get all department talks
router.get("/", departmentTalkController.getAllTalks);

// Get talks by id
router.get("/:id", departmentTalkController.getTalkById);

// Update talk by id
router.put("/:id", departmentTalkController.updateTalk);

// Delete talk by id
router.delete("/:id", departmentTalkController.deleteTalk);

module.exports = router;
