const mongoose = require("mongoose");

const facultyAwardSchema = new mongoose.Schema({
  facultyName: {
    type: String,
    required: true,
  },
  title: {
    type: String, // e.g., "Editorial Board Member (Computational Science)"
    required: true,
  },
  organization: {
    type: String, // e.g., "Scientific Reports, Nature Portfolio"
    required: true,
  },
  journalInfo: {
    type: String, // e.g., "Q1, SCI: IF 3.8"
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  category: {
    type: String,
    enum: ["Faculty", "Student", "Department"],
    default: "Faculty",
  }
});

module.exports = mongoose.model("FacultyAward", facultyAwardSchema);
