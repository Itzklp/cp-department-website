const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty", // reference to Faculty collection
      required: true,
    }
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
