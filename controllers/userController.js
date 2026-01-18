const bcrypt = require('bcryptjs');
const User = require('../models/userModel.js');
const Donation = require('../models/donationModel.js');



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
  
  const { name, email, mobile,address,dob,nationality,education,picture } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (address) user.address = address;
    if (mobile) user.mobile = mobile;
    if (dob) user.dob = dob;
    if (nationality) user.nationality = nationality;
    if (education) user.education = education;
     if (picture) user.picture = picture;



    await user.save();
    res.json(user);

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



// -----------------------------update valteer-status-----------------------------------

const updateValenteerStatus = async (req, res) => {
  console.log("isVolunteer",req.body.isVolunteer)
  try {
    let { googleId, isVolunteer } = req.body;

    if (!googleId) {
      return res.status(400).json({ message: "Valid googleId is required" });
    }

    googleId = String(googleId).trim();

    if (typeof isVolunteer === "string") {
      if (isVolunteer.toLowerCase() === "true") isVolunteer = true;
      else if (isVolunteer.toLowerCase() === "false") isVolunteer = false;
      else
        return res
          .status(400)
          .json({ message: "isVolunteer must be boolean or 'true'/'false'" });
    }

    if (typeof isVolunteer !== "boolean") {
      return res.status(400).json({ message: "isVolunteer must be boolean" });
    }

    // Find and update the user
    const user = await User.findOneAndUpdate(
      { googleId: googleId },   // find by googleId
      { isVolunteer: isVolunteer },     // update field
      { new: true }             // return the updated document
    );

    if (!user) return res.status(404).json({ message: "User not found" });

 

    res.json({ message: "Volunteer status updated", user });
  } catch (err) {
    console.error("Error updating admin status:", err);
    res.status(500).json({ message: "Server error" });
  }
};





// Get all donations with pagination
const getDonations = async (req, res) => {
  try {
    // Fetch all donations with campaign details if needed
    const donations = await Donation.find().populate("campaignId", "title description");

    if (!donations || donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No donations found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donations fetched successfully",
      data: donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};


module.exports = { registerUser,getAllUsers,updateUser,updateAdminStatus,updateValenteerStatus,getDonations};





