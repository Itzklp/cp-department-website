// routes/conferenceRoute.js
const express = require("express");
const router = express.Router();
const conferenceController = require("../controllers/conferenceController");

// Routes
router.post("/", conferenceController.createConference);
router.get("/", conferenceController.getConferences);
router.get("/:id", conferenceController.getConferenceById);
router.put("/:id", conferenceController.updateConference);
router.delete("/:id", conferenceController.deleteConference);

module.exports = router;
