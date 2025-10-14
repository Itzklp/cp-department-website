const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const thesisController = require("../controllers/phdThesisController");

// Bulk Upload Controller
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
router.post("/bulk", upload.single("file"), thesisController.bulkUploadTheses);

// Add PhD Thesis
router.post("/", thesisController.createThesis);

// Get all PhD Theses
router.get("/", thesisController.getAllTheses);

//Get thesis by ID
router.get("/:id", thesisController.getThesisById);

// Update thesis by ID
router.put("/:id", thesisController.updateThesis);

// Delete thesis by ID
router.delete("/:id", thesisController.deleteThesis);

module.exports = router;
