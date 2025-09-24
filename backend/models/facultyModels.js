const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
  },
  researchArea: {
    type: [String],
    default: [],
  },
  teaches: {
    type: [String],
    default: [],
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  designation: {
    type: String,
    default: "Prof.",   // <-- added this
    trim: true,
  },
});

module.exports = mongoose.model("Faculty", facultySchema);
