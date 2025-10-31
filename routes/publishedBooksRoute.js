const express = require("express");
const {
  addPublishedBook,
  getPublishedBooks,
  getPublishedBooksByAuthor,
  searchPublishedBooksByTitle,
  updatePublishedBook,
  deletePublishedBook,
  bulkUploadPublishedBooks, // imported from controller
} = require("../controllers/publishedBooksController");

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();

// Add new book / book chapter
router.post("/", addPublishedBook);
router.get("/", getPublishedBooks);
router.get("/author/:author", getPublishedBooksByAuthor);
router.get("/search", searchPublishedBooksByTitle);
router.put("/:id", updatePublishedBook);
router.delete("/:id", deletePublishedBook);

// ✅ Upload config
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only XLSX files are allowed!"), false);
    }
  },
});

// ✅ Bulk upload route (controller will handle logic)
router.post("/bulk", upload.single("file"), bulkUploadPublishedBooks);

module.exports = router;
