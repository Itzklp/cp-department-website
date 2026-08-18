const mongoose = require("mongoose");

const phdThesisSchema = new mongoose.Schema({
  // ---- Basic Info ---- ("Name", "ID No", "Desig")
  scholarName: {
    type: String,
    required: true,
  },
  studentId: {
    type: String, // "ID No"
  },
  designation: {
    // "Desig" e.g. "JRF+Ph.D. Scholar"
    type: String,
    default: "",
  },

  // ---- Stipend / Funding ---- ("Source of Stipend")
  sourceOfStipend: {
    // multi-choice: Institute Fellowship / Sponsored Project / Self-Finance / Other
    type: [String],
    default: [],
  },
  sponsoredProjectName: {
    // shown only when "Sponsored Project" is selected as a stipend source
    type: String,
    default: "",
  },

  // ---- Contact ---- ("Mobile No", "LAB No.", "Intercom No.")
  mobileNo: { type: String, default: "" },
  labNo: { type: String, default: "" },
  intercomNo: { type: String, default: "" },

  // ---- Research Info ----
  thesisTitle: {
    // "Proposed Topic of Research"
    type: String,
    required: true,
  },
  supervisor: {
    type: String,
    required: true,
  },
  coSupervisor: {
    // "Co-Supervisor(s)" - multi-choice
    type: [String],
    default: [],
  },
  dacMember1: { type: String, default: "" },
  dacMember2: { type: String, default: "" },

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

  // ---- Milestone Dates ----
  dateOfJoining: { type: Date }, // "DOJ"
  instituteFellowshipStartDate: { type: Date }, // "Institute Fellowship Started W.E.F"
  instituteStipendEndDate: { type: Date }, // "Inst Stipend Ended on"
  qeAttempt1Date: { type: Date }, // "Date (1st attempt of QE)"
  qeAttempt2Date: { type: Date }, // "Date (2nd attempt of QE (if any))"
  dateOfPhdQualified: { type: Date }, // "Qualifying Passed on"
  dateOfProposal: { type: Date }, // "Date of Proposal Presentation"
  proposalApprovedDate: { type: Date }, // "Proposal Approved on"
  dateOfPreSubmission: { type: Date }, // "Date of Pre Sumission Seminar"
  dateOfThesisSubmission: { type: Date },
  dateOfVivaVoce: { type: Date }, // "Date of Viva Voce Exam"

  // ---- Misc ----
  remarks: { type: String, default: "" }, // "Remarks (if any)"
}, { timestamps: true });

module.exports = mongoose.model("PhDThesis", phdThesisSchema);