const PublishedBook = require("../models/publishedBooksModel");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

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

// Bulk upload from Excel file (for initial data population)
const bulkUploadPublishedBooks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "..", req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const inserted = [];

    for (const row of sheetData) {
      // Read values from Excel row
      const title = row["Title"]?.trim();
      const author = row["Author"]?.trim();
      const type = row["Type"]?.trim();
      const publisher = row["Publisher"]?.trim();
      const series = row["Series"]?.trim() || "";
      const year = parseInt(row["Year"]);
      const link = row["Link"]?.trim() || "";

      if (!title || !author || !type || !publisher || !year) continue; // skip invalid rows

      const book = new PublishedBook({
        title,
        author,
        type,
        publisher,
        series,
        year,
        link,
      });

      await book.save();
      inserted.push(book);
    }

    fs.unlinkSync(filePath); // remove uploaded file

    res.status(201).json({
      message: `${inserted.length} books uploaded successfully`,
      books: inserted,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
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
  bulkUploadPublishedBooks,
};
