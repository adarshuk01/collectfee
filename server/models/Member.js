const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subscriptionId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MemberSubscription",
    default: null
  },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },

  status: { type: String, enum: ["active", "expired", "inactive", "due"], default: "active" },
  fullName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String  },
  address: { type: String },
  startDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model("Member", memberSchema);
