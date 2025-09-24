// models/conferenceModel.js
const mongoose = require("mongoose");

const conferenceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["National", "International"],
    required: true,
  },
  authors: {
    type: [String],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  conferenceName: {
    type: String,
    required: true,
  },
  pages: {
    type: String,
  },
  publisher: {
    type: String,
  },
  location: {
    type: String,
  },
  date: {
    type: String, // could use Date if you want strict date format
  },
});

module.exports = mongoose.model("Conference", conferenceSchema);
