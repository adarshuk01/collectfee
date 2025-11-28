// models/MemberPayment.js
const mongoose = require("mongoose");

const feeTypeSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  isRecurring: { type: Boolean, default: false }
});

const memberPaymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPackage", required: true },

  memberSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "MemberSubscription" },

  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },

  feeType: [feeTypeSchema],   // ✅ NEW FIELD

  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["due", "paid", "partial"], default: "due" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MemberPayment", memberPaymentSchema);
