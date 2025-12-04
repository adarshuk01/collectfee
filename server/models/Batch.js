const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, // Morning Batch, Evening Batch
  description: { type: String },
  timing: { type: String }, // Example: "6 AM - 7 AM"
}, { timestamps: true });

module.exports = mongoose.model("Batch", batchSchema);
