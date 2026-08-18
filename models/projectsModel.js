const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  psrn: {
    // "PSRN" - project reference number
    type: String,
    trim: true,
  },
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
    // "Agency"
    type: String,
    required: true,
    trim: true,
  },
  scheme: {
    // "Scheme"
    type: String,
    trim: true,
  },
  dateSanctioned: {
    // "Sanctioned Date"
    type: Date,
    required: true,
  },
  projectStartDate: {
    // "Project Start Date"
    type: Date,
  },
  dateCompletion: {
    // "Project End Date"
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
    // "Amount Sanctioned (Rs)"
    type: Number,
    required: true,
  },
  type: {
    // "Type of Project (Consultancy/Sponsored)"
    type: String,
    enum: ["Consultancy", "Sponsored"],
    required: true,
  },
  category: {
    // "Type of Project (Govt/Industry/International)"
    type: String,
    enum: ["Govt", "Industry", "International"],
    required: true,
  },
});

module.exports = mongoose.model("Project", projectSchema);
