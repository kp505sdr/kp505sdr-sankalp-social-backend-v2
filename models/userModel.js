const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    mobile: { type: Number },
    address:{ type: String },
    dob:{ type: Date }, 
    nationality:{ type: String },
    education:{ type: String },
    picture: { type: String },
    isAdmin: { type: Boolean, default: false },
    isVolunteer:{
    type:Boolean,
    default:false,
  },
  volunteerId:{
    type:Number,
 
  },
  },
  { timestamps: true } // Correct way to enable createdAt & updatedAt
);

const User = mongoose.model('User', userSchema);
module.exports = User;
