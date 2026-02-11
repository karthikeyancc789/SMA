const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema({
  className: String,
  expiresAt: Date
});

module.exports = mongoose.model("QRSession", qrSchema);
