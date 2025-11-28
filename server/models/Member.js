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
    required: true
  },
  fullName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String  },
  address: { type: String },
  startDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Member", memberSchema);
