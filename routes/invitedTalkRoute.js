const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const invitedTalkController = require("../controllers/invitedTalkController");


// Bulk Data Upload
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
router.post("/bulk", upload.single("file"), invitedTalkController.bulkUploadTalks);

// Add Invited Talk
router.post("/", invitedTalkController.createTalk);

// Get all Invited Talks
router.get("/", invitedTalkController.getAllTalks);

// Get Invited Talk by ID 
router.get("/:id", invitedTalkController.getTalkById);

// Update Invited Talk by ID
router.put("/:id", invitedTalkController.updateTalk);

// Delete Invited Talk by ID
router.delete("/:id", invitedTalkController.deleteTalk);

module.exports = router;
