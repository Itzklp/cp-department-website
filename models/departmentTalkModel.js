const mongoose = require("mongoose");

const departmentTalkSchema = new mongoose.Schema({
  speaker: {
    type: String,
    required: true,
  },
  designation: {
    type: String, // e.g., "IEEE Fellow, ACM Distinguished Scientist Director..."
  },
  affiliation: {
    type: String, // e.g., "Hewlett Packard Labs"
  },
  title: {
    type: String, // e.g., "Realizing Artificial Intelligence..."
    required: true,
  },
  date: {
    type: String, // store as string like "Sept 23, 2024"
    required: true,
  },
  type: {
    type: String,
    enum: ["Invited Talk", "Distinguished Lecture", "Research Talk"],
    default: "Invited Talk",
  }
});

module.exports = mongoose.model("DepartmentTalk", departmentTalkSchema);
