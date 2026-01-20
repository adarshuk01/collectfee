const mongoose = require("mongoose");


const attendanceSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or Client
      required: true,
      index: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// prevent duplicate attendance per day
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);

