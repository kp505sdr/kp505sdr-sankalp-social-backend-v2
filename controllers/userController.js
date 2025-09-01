const bcrypt = require('bcryptjs');
const User = require('../models/userModel.js');



const registerUser = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    // Return user data without password
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ----------------------------------------------get----------------------------------


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};





// ---------------------update-user-----------------------------------

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// --------------------------pdate user or admin--------------------------

const updateAdminStatus = async (req, res) => {
  try {
    let { googleId, isAdmin } = req.body;

    if (!googleId) {
      return res.status(400).json({ message: "Valid googleId is required" });
    }

    googleId = String(googleId).trim();

    if (typeof isAdmin === "string") {
      if (isAdmin.toLowerCase() === "true") isAdmin = true;
      else if (isAdmin.toLowerCase() === "false") isAdmin = false;
      else
        return res
          .status(400)
          .json({ message: "isAdmin must be boolean or 'true'/'false'" });
    }

    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ message: "isAdmin must be boolean" });
    }

    // Find and update the user
    const user = await User.findOneAndUpdate(
      { googleId: googleId },   // find by googleId
      { isAdmin: isAdmin },     // update field
      { new: true }             // return the updated document
    );

    if (!user) return res.status(404).json({ message: "User not found" });

 

    res.json({ message: "Admin status updated", user });
  } catch (err) {
    console.error("Error updating admin status:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { registerUser,getAllUsers,updateUser,updateAdminStatus};





