const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, expires: 300, default: Date.now }, // expires in 5 minutes
});

module.exports = mongoose.model("Otp", OtpSchema);
