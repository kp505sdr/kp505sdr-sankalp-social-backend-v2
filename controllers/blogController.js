
const Blog = require('../models/blogModel.js');

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

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };
