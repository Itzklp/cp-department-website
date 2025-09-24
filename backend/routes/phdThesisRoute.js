const express = require("express");
const router = express.Router();
const thesisController = require("../controllers/phdThesisController");

// Routes
router.post("/", thesisController.createThesis);
router.get("/", thesisController.getAllTheses);
router.get("/:id", thesisController.getThesisById);
router.put("/:id", thesisController.updateThesis);
router.delete("/:id", thesisController.deleteThesis);

module.exports = router;
