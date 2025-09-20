// routes/conferenceRoute.js
const express = require("express");
const XLSX = require('xlsx');
const multer = require("multer");
const router = express.Router();
const conferenceController = require("../controllers/conferenceController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post("/", conferenceController.createConference);
router.get("/", conferenceController.getConferences);
router.get("/:id", conferenceController.getConferenceById);
router.put("/:id", conferenceController.updateConference);
router.delete("/:id", conferenceController.deleteConference);

// New Added
router.post("/upload",upload.single('file'),conferenceController.uploadFile)

module.exports = router;
