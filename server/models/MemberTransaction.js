const mongoose = require("mongoose");

const memberTransactionSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "MemberPayment", required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  memberSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "MemberSubscription", required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPackage", required: true },
  

  paidAmount: { type: Number, required: true },

  mode: { type: String, enum: ["cash", "upi", "card", "bank"], default: "cash" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MemberTransaction", memberTransactionSchema);
