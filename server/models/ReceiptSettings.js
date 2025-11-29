const mongoose = require("mongoose");

const ReceiptSettingsSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },    
  businessName: { type: String, default: "My Institute" },
  address: { type: String, default: "Your Address" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },

  // Colors
  themeColor: { type: String, default: "#0B57D0" },
  textColor: { type: String, default: "#000000" },

  // User uploaded logo URL (Cloudinary / local)
  logoUrl: { type: String, default: "" },

  // Custom Footer
  footerMessage: { type: String, default: "Thank you for your payment!" },

}, { timestamps: true });

module.exports = mongoose.model("ReceiptSettings", ReceiptSettingsSchema);
