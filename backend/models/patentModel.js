const mongoose = require("mongoose");

const patentSchema = new mongoose.Schema({
  authors: {
    type: [String],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  applicationNumber: {
    type: String,
    required: true,
  },
  filingDate: {
    type: String, // keeping string for flexibility (e.g. "2024, September 10")
    required: true,
  },
  country: {
    type: String,
    default: "India",
  },
  status: {
    type: String,
    enum: ["Filed", "Published", "Granted", "Pending"],
    default: "Filed",
  }
});

module.exports = mongoose.model("Patent", patentSchema);
