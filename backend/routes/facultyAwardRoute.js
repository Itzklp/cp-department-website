const express = require("express");
const router = express.Router();
const facultyAwardController = require("../controllers/facultyAwardController");

// Routes
router.post("/", facultyAwardController.createAward);
router.get("/", facultyAwardController.getAllAwards);
router.get("/:id", facultyAwardController.getAwardById);
router.put("/:id", facultyAwardController.updateAward);
router.delete("/:id", facultyAwardController.deleteAward);

module.exports = router;
