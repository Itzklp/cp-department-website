const mongoose = require("mongoose");

const publishedBookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Book", "Book Chapter"],
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  series: {
    type: String, // e.g., "University Texts in the Mathematical Sciences"
  },
  year: {
    type: Number,
    required: true,
  },
  link: {
    type: String,
  },
});

module.exports = mongoose.model("PublishedBook", publishedBookSchema);
