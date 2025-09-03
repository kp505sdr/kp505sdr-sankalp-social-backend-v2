const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
  images: [String],
  
});

module.exports = mongoose.model("Slide", slideSchema);
