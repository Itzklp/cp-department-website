const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectPI: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty", // reference Faculty model
    required: true,
  },
  projectCoPI: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty", // reference Faculty model
  },
  collaborator: {
    type: String,
    trim: true,
  },
  projectTitle: {
    type: String,
    required: true,
    trim: true,
  },
  fundingAgency: {
    type: String,
    required: true,
    trim: true,
  },
  dateSanctioned: {
    type: Date,
    required: true,
  },
  dateCompletion: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    trim: true,
  },
  notableAchievements: {
    type: [String],
    default: [],
  },
  sanctionLetterLink: {
    type: String,
    trim: true,
  },
  totalINR: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["National", "International"],
    required: true,
  },
  category: {
    type: String,
    enum: ["Government", "Industry"],
    required: true,
  },
});

module.exports = mongoose.model("Project", projectSchema);
