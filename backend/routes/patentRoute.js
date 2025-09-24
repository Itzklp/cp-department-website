const express = require("express");
const router = express.Router();
const patentController = require("../controllers/patentController");

// Routes
router.post("/", patentController.createPatent);
router.get("/", patentController.getAllPatents);
router.get("/:id", patentController.getPatentById);
router.put("/:id", patentController.updatePatent);
router.delete("/:id", patentController.deletePatent);

module.exports = router;
