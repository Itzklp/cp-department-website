const express = require("express");
const {
  addPublishedBook,
  getPublishedBooks,
  getPublishedBooksByAuthor,
  searchPublishedBooksByTitle,
  updatePublishedBook,
  deletePublishedBook,
  bulkUploadPublishedBooks,
} = require("../controllers/publishedBooksController");

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();

// Add new book / book chapter
router.post("/", addPublishedBook);

// Get all books OR filter by author (query param)
router.get("/", getPublishedBooks);

// Get books by author (route param)
router.get("/author/:author", getPublishedBooksByAuthor);

// Search books by title
router.get("/search", searchPublishedBooksByTitle);

// Update book by ID
router.put("/:id", updatePublishedBook);

// Delete book by ID
router.delete("/:id", deletePublishedBook);

// Bulk upload books via Excel file
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
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
router.post("/bulk", upload.single("file"), bulkUploadPublishedBooks);

module.exports = router;
