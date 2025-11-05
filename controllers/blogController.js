
const Blog = require('../models/blogModel.js');
const Contact=require('../models/contactModel.js')

require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// CREATE a new blog
const createBlog = async (req, res) => {
  
  try {
    const { title, description, image, author } = req.body;

    if (!title || !description || !image) {
      return res.status(400).json({ error: "Title, description, and image are required" });
    }

    const newBlog = new Blog({ title, description, image, author });
    await newBlog.save();

    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog", details: error.message });
  }
};

// Get all blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find(); // author is embedded, no need for populate
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs", details: error.message });
  }
};

// GET single blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email");
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog", details: error.message });
  }
};

// UPDATE blog
const updateBlog = async (req, res) => {
  try {
    const { title, description, image } = req.body;

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, image },
      { new: true, runValidators: true }
    );

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog", details: error.message });
  }
};

// DELETE blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog", details: error.message });
  }
};





// ---------------contact---message--------------------------




const contactMessage = async (req, res) => {
  try {
    const { fullName, contactNo, email, subject, message } = req.body;

    // Basic validation
    if (!fullName || !contactNo || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Save to MongoDB
    const newContact = new Contact({ fullName, contactNo, email, subject, message });
    await newContact.save();

    // Email to user (confirmation)
    const userEmail = await resend.emails.send({
      from: "Sankalp Social Trust <sankalpsocialtrustsdr@gmail.com>",
      to: email,
      subject: "✅ We received your message",
      html: `
        <p>Hi ${fullName},</p>
        <p>Thank you for contacting us! We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        <br/>
        <p>Best regards,<br/>Sankalp Social Trust</p>
      `,
      text: `
Hi ${fullName},

Thank you for contacting us! We have received your message and will get back to you as soon as possible.

Here is a copy of your submission:

Name       : ${fullName}
Contact No : ${contactNo}
Email      : ${email}
Subject    : ${subject}
Message    :
${message}

Best regards,
Sankalp Social Trust
      `,
    });

    // Email to admin
    const adminEmail = await resend.emails.send({
      from: `${fullName} <${email}>`,
      to: "sankalpsocialtrustsdr@gmail.com",
      subject: `📩 New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Contact No:</strong> ${contactNo}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        <hr/>
        <p>Please follow up as necessary.</p>
      `,
      text: `
You have received a new contact form submission:

Name       : ${fullName}
Contact No : ${contactNo}
Email      : ${email}
Subject    : ${subject}
Message    :
${message}

Please follow up as necessary.
      `,
    });

    if (userEmail.error || adminEmail.error) {
      throw new Error("Email sending failed");
    }

    return res.json({
      success: true,
      message: "Message sent and saved successfully!",
    });
  } catch (error) {
    console.error("Error in contact form:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again later." });
  }
};



module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog ,contactMessage};
