const express = require("express");
const {
  addPublishedBook,
  getPublishedBooks,
  getPublishedBooksByAuthor,
  searchPublishedBooksByTitle,
  updatePublishedBook,
  deletePublishedBook,
} = require("../controllers/publishedBooksController");

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

module.exports = router;
