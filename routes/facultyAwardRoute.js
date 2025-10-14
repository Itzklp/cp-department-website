const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const facultyAwardController = require("../controllers/facultyAwardController");

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
router.post("/bulk", upload.single("file"), facultyAwardController.bulkUploadAwards);


// Add Faculty Award
router.post("/", facultyAwardController.createAward);

// Get all Faculty Awards
router.get("/", facultyAwardController.getAllAwards);

// Get Faculty Award by ID
router.get("/:id", facultyAwardController.getAwardById);

// Update Faculty Award
router.put("/:id", facultyAwardController.updateAward);

// Delete Faculty Award
router.delete("/:id", facultyAwardController.deleteAward);

module.exports = router;
