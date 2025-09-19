const express = require("express");
const router = express.Router();
const invitedTalkController = require("../controllers/invitedTalkController");

// Routes
router.post("/", invitedTalkController.createTalk);
router.get("/", invitedTalkController.getAllTalks);
router.get("/:id", invitedTalkController.getTalkById);
router.put("/:id", invitedTalkController.updateTalk);
router.delete("/:id", invitedTalkController.deleteTalk);

module.exports = router;
