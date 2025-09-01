const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
  images: [String], // array of image URLs
});

module.exports = mongoose.model("Slide", slideSchema);
