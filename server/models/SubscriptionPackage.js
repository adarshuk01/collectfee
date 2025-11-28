// models/SubscriptionPackage.js
const mongoose = require("mongoose");

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: false ,type: Number,},
   isRecurring:{ type: Boolean, default: false},
});

const subscriptionPackageSchema = new mongoose.Schema(
  {
    subscriptionName: {
      type: String,
      required: true,
      trim: true,
    },
    admissionFee: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "weekly", "yearly", "quarterly"],
      default: "monthly",
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recurringAmount:{
    type: Number,  
    },
   

    customFields: [customFieldSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPackage", subscriptionPackageSchema);
