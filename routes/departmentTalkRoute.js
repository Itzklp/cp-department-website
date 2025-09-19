const express = require("express");
const router = express.Router();
const departmentTalkController = require("../controllers/departmentTalkController");

// Routes
router.post("/", departmentTalkController.createTalk);
router.get("/", departmentTalkController.getAllTalks);
router.get("/:id", departmentTalkController.getTalkById);
router.put("/:id", departmentTalkController.updateTalk);
router.delete("/:id", departmentTalkController.deleteTalk);

module.exports = router;
