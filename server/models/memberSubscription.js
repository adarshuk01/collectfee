const mongoose = require("mongoose");

const memberSubscriptionSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPackage", required: true },

  startDate: { type: Date, required: true, default: Date.now },
  nextRenewalDate: { type: Date, required: true },



  status: { type: String, enum: ["active", "expired", "inactive", "due"], default: "active" },

  dueAmount: { type: Number, default: 0 },     // ➤ Add this
  paidAmount: { type: Number, default: 0 }      // ➤ Add this
});

module.exports = mongoose.model("MemberSubscription", memberSubscriptionSchema);
