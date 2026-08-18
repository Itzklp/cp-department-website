const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  psrn: {
    // "PSRN"
    type: String,
    trim: true,
  },
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
  instituteEmail: {
    // second "Email ID" column in the sheet (institute-issued address)
    type: String,
    lowercase: true,
    trim: true,
    default: "",
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
    // "DOJ"
    type: Date,
    default: Date.now,
  },
  designation: {
    // "Current Designation"
    type: String,
    default: "Prof.",
    trim: true,
  },

  // ---- Contact ---- ("Mobile No.", "Chamber No.", "Intercom No.")
  mobileNo: { type: String, default: "" },
  chamberNo: { type: String, default: "" },
  intercomNo: { type: String, default: "" },

  // ---- Promotion history ----
  promotedASTPDate: { type: Date }, // "Promoted as ASTP w.e.f."
  promotedASOPDate: { type: Date }, // "Promoted as ASOP w.e.f."
  promotedProfessorDate: { type: Date }, // "Promoted as Professor w.e.f"
  promotedSrProfessorDate: { type: Date }, // "Promoted as Sr. Professor w.e.f"

  // ---- PhD involvement (informational; also derivable from PhDThesis records) ----
  phdScholarsSupervised: {
    // "Name of Ph.D. Scholars Under Supervision"
    type: [String],
    default: [],
  },
  phdDacMembership: {
    // "Name of PhD Students Under DAC Membership"
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Faculty", facultySchema);
