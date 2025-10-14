const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const {
  addPublication,
  getPublications,
  getPublicationsByProfessor,
  searchPublicationsByTitle,
  updatePublication,
  deletePublication,
  bulkUploadPublications,
} = require("../controllers/publicationController");

const router = express.Router();

// ✅ Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer for XLSX file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
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

// Route to add publication
router.post("/", addPublication);

//Route to get all publications
router.get("/", getPublications);

//Route to get publications by professor ID
router.get("/professor/:professorId", getPublicationsByProfessor);

//Route to search publications by title
router.get("/search", searchPublicationsByTitle);

//Route to update publication by ID
router.put("/:id", updatePublication);

//Route to delete publication by ID
router.delete("/:id", deletePublication);

//Route for bulk upload of publications via XLSX file
router.post("/bulk", upload.single("file"), bulkUploadPublications);

module.exports = router;
