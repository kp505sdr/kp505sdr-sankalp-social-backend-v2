
const mongoose = require("mongoose");
const { Schema } = mongoose;

const BlogSchema = new Schema(
  {
    title: {
      type: String,
 
   
    },
 
    description: {
      type: String,
  
  
    },
    image: {
      type: String, // store URL
   
    },
 
 
    author: {
      userId:{type: Schema.Types.ObjectId,
      ref: "User", // optional: if you have a User model
      default: null,},

        name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      picture: {
        type: String, // store profile image URL
        default: "",
      },
    },


  },
  { timestamps: true }
);



module.exports = mongoose.model("Blog", BlogSchema);
