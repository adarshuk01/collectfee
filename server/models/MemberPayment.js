// models/MemberPayment.js
const mongoose = require("mongoose");

const feeTypeSchema = new mongoose.Schema({
  key: { type: String }, // admission_fee, recurring_fee, custom_xxx
  label: { type: String, required: true },

  amount: { type: Number, required: true }, // total fee amount
  paidAmount: { type: Number, default: 0 }, // 🔥 NEW

  isRecurring: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["due", "partial", "paid"],
    default: "due"
  }
});


const memberPaymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPackage", required: true },
  memberSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "MemberSubscription" },

  feeType: [feeTypeSchema], // 🔥 now tracks payment per fee

  amount: { type: Number, required: true }, // sum of all feeType.amount
  paidAmount: { type: Number, default: 0 },

  dueDate: { type: Date, required: true },

  status: {
    type: String,
    enum: ["due", "paid", "partial"],
    default: "due"
  },

  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("MemberPayment", memberPaymentSchema);
