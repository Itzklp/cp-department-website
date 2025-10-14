const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const patentController = require("../controllers/patentController");


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
router.post("/bulk", upload.single("file"), patentController.bulkUploadPatents);

// Add patent data
router.post("/", patentController.createPatent);

// Get patent data
router.get("/", patentController.getAllPatents);

// Get patent by ID
router.get("/:id", patentController.getPatentById);

// Update patent by ID
router.put("/:id", patentController.updatePatent);

// Delete patent by ID
router.delete("/:id", patentController.deletePatent);

module.exports = router;
