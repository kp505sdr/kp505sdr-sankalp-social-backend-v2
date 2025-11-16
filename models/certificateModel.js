

const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
  donorName: String,
  donorEmail: String,
  donorAddress: String,
  donorMobile: String,
  donationAmount: String,
  purpose: String,
  genratedBy:Object,
  date: { type: Date, default: Date.now },
  }

);

module.exports = mongoose.model("certificate80", certificateSchema);
