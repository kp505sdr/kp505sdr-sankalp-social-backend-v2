const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    picture: { type: String },
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: true } // Correct way to enable createdAt & updatedAt
);

const User = mongoose.model('User', userSchema);
module.exports = User;
