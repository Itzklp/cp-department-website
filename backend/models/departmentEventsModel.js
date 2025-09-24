const mongoose = require("mongoose");

const departmentEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Seminar", "Workshop", "Conference", "Event"],
    default: "Event",
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  organizedBy: {
    type: String,
    default: "Department",
  },
});

module.exports = mongoose.model("DepartmentEvent", departmentEventSchema);
