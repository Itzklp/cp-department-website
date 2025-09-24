const mongoose = require("mongoose");

const phdThesisSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  supervisor: {
    type: String,
    required: true,
  },
  coSupervisor: {
    type: String,
    default: "",
  },
  yearAwarded: {
    type: Number,
    default: 2024,
  },
});

module.exports = mongoose.model("PhDThesis", phdThesisSchema);
