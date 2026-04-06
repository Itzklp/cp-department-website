const mongoose = require("mongoose");

const phdThesisSchema = new mongoose.Schema({
  scholarName: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
  },
  thesisTitle: {
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
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  status: {
    type: String,
    default: "Ongoing",
  },
  fellowshipProgram: {
    type: String,
    enum: ["Institute Fellow", "Industry Sponsored Fellowship", "Other"],
    default: "Institute Fellow"
  },
  dateOfJoining: { type: Date },
  dateOfProposal: { type: Date },
  dateOfPhdQualified: { type: Date },
  dateOfPreSubmission: { type: Date },
  dateOfThesisSubmission: { type: Date },
  dateOfVivaVoce: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("PhDThesis", phdThesisSchema);