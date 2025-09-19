const mongoose = require("mongoose");

const invitedTalkSchema = new mongoose.Schema({
  speaker: {
    type: String,
    required: true,
  },
  title: {
    type: String, // e.g., "Applications of AI in Sports"
    required: true,
  },
  event: {
    type: String, // e.g., "Workshop entitled 'Understanding AI...'"
  },
  organizer: {
    type: String, // e.g., "AIOS (All India Ophthalmological Society)"
  },
  location: {
    type: String, // e.g., "Manbhum Mahavidyalaya, WB" or "Online"
  },
  date: {
    type: String, // store as string ("18–22 Aug 2024" or "14 Sep 2024")
  },
  mode: {
    type: String,
    enum: ["Online", "Offline", "Hybrid"],
    default: "Online",
  },
  role: {
    type: String, // e.g., "Speaker", "Panelist"
    default: "Speaker",
  }
});

module.exports = mongoose.model("InvitedTalk", invitedTalkSchema);
