const PublishedBook = require("../models/publishedBooksModel");

// Add new published book / chapter
const addPublishedBook = async (req, res) => {
  try {
    const book = new PublishedBook(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all published books OR filter by author (query param)
const getPublishedBooks = async (req, res) => {
  try {
    const { author } = req.query;
    const books = author
      ? await PublishedBook.find({ author: new RegExp(author, "i") })
      : await PublishedBook.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get books by author (route param)
const getPublishedBooksByAuthor = async (req, res) => {
  try {
    const { author } = req.params;
    const books = await PublishedBook.find({ author: new RegExp(author, "i") });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search books by title
const searchPublishedBooksByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ message: "Title query is required" });
    }
    const books = await PublishedBook.find({
      title: new RegExp(title, "i"),
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update published book by ID
const updatePublishedBook = async (req, res) => {
  try {
    const book = await PublishedBook.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete published book by ID
const deletePublishedBook = async (req, res) => {
  try {
    const book = await PublishedBook.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addPublishedBook,
  getPublishedBooks,
  getPublishedBooksByAuthor,
  searchPublishedBooksByTitle,
  updatePublishedBook,
  deletePublishedBook,
};
