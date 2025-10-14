const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  // Department faculty authors (references)
  authors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty", // reference to Faculty collection
    },
  ],
  // External authors (not in our department)
  otherAuthors: [
    {
      type: String, // store names directly
      trim: true,
    },
  ],
  year: {
    type: Number,
    required: true,
  },
  journal: {
    type: String,
    required: true,
  },
  volume: String,
  issue: String,
  pages: String,
  doi: String,
});

module.exports = mongoose.model("Publication", publicationSchema);
