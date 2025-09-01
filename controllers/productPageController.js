const ProductPage = require("../models/productModel.js");
const Slide = require("../models/slideModel.js");

// CREATE

const createProductPage = async (req, res) => {
  try {


    // Ensure goalAmount is number
    if (req.body.goalAmount) {
      req.body.goalAmount = Number(req.body.goalAmount);
    }

    const newProductPage = new ProductPage(req.body);
    const savedPage = await newProductPage.save();

    res.status(201).json(savedPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET ALL
const getAllProductPages = async (req, res) => {
  try {
    const pages = await ProductPage.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
const getProductPageById = async (req, res) => {
  try {
    const page = await ProductPage.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE WHEN GET DONATION
const updateProductPageGetdonation = async (req, res) => {
  try {
    const { name, email, mobile, amount, transactionId, status } = req.body;

    // Find the product page first
    const productPage = await ProductPage.findById(req.params.id);

    if (!productPage) return res.status(404).json({ message: "Not found" });

    // If donation is provided, add to donors array
    if (req.body.transactionId &&  amount) {
      const newDonor = {
        name,
        email,
        mobile,
        amount,
        transactionId,
        status,
        id: `DONOR-${Date.now()}`, // optional unique id
        donatedAt: new Date(),
      };

      productPage.donation.donors.push(newDonor);
      productPage.donation.raised += amount;

    }

    // Update other fields if needed
    if (req.body.title) productPage.title = req.body.title;
    if (req.body.description) productPage.description = req.body.description;
    if (req.body.videoUrl) productPage.videoUrl = req.body.videoUrl;
    if (req.body.campaignImages) productPage.campaignImages = req.body.campaignImages;
    if (req.body.category) productPage.category = req.body.category;
    if (req.body.campaignDetails) productPage.campaignDetails = req.body.campaignDetails;

    const updated = await productPage.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// DELETE
const deleteProductPage = async (req, res) => {
  try {
    const deleted = await ProductPage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};










const updateProductPage = async (req, res) => {
  try {
    const { id } = req.params; // Expect campaign ID in URL

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const updateData = { ...req.body };

    // Ensure goalAmount is a number if provided
    if (updateData.goalAmount) {
      updateData.goalAmount = Number(updateData.goalAmount);
    }

    // Find the product by ID and update
    const updatedPage = await ProductPage.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // return updated document & validate fields
    );

    if (!updatedPage) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};









// ----------------------------slide--------------------------
// const slideFun = async (req, res) => {
//   try {
//     const { images } = req.body;
  

//     // Check if images exist and not empty
//     if (!images || (Array.isArray(images) && images.length === 0)) {
//       return res.status(400).json({ error: "Image URL(s) required" });
//     }

//     // Create new slide
//     const newSlide = new Slide({ images });
//     await newSlide.save();

//     res.status(201).json({ message: "Slide saved successfully", slide: newSlide });
//   } catch (error) {
//     console.error("Error saving slide:", error);
//     res.status(500).json({ error: "Failed to save slide" });
//   }
// };
const slideFun = async (req, res) => {
  try {
    const { images } = req.body;

    // Validate images
    if (!images || (Array.isArray(images) && images.length === 0)) {
      return res.status(400).json({ error: "Image URL(s) required" });
    }

    // Check if a slide already exists
    const existingSlide = await Slide.findOne();
    if (existingSlide) {
      return res.status(400).json({ error: "Slide already exists. Update it instead." });
    }

    // Create new slide only if none exists
    const newSlide = new Slide({ images });
    await newSlide.save();

    res.status(201).json({ message: "Slide saved successfully", slide: newSlide });
  } catch (error) {
    console.error("Error saving slide:", error);
    res.status(500).json({ error: "Failed to save slide" });
  }
};

// GET All Slides
const getSlides = async (req, res) => {
  try {
    const slides = await Slide.find().sort({ createdAt: -1 });
    res.status(200).json(slides);
  } catch (error) {
    console.error("Error fetching slides:", error);
    res.status(500).json({ error: "Failed to fetch slides" });
  }
};



// UPDATE Slide
const updateSlide = async (req, res) => {
  try {
   
    const { images,id } = req.body;

    if (!images || (Array.isArray(images) && images.length === 0)) {
      return res.status(400).json({ error: "Image URL(s) required" });
    }

    const updatedSlide = await Slide.findByIdAndUpdate(
      id,
      { images },
      { new: true } // returns updated slide
    );

    if (!updatedSlide) return res.status(404).json({ error: "Slide not found" });

    res.status(200).json({ message: "Slide updated successfully", slide: updatedSlide });
  } catch (error) {
    console.error("Error updating slide:", error);
    res.status(500).json({ error: "Failed to update slide" });
  }
};

// DELETE Slide
const deleteSlide = async (req, res) => {

  try {
    const { id } = req.body;

    const deletedSlide = await Slide.findByIdAndDelete(id);
    if (!deletedSlide) return res.status(404).json({ error: "Slide not found" });

    res.status(200).json({ message: "Slide deleted successfully" });
  } catch (error) {
    console.error("Error deleting slide:", error);
    res.status(500).json({ error: "Failed to delete slide" });
  }
};





module.exports = {
  createProductPage,
  updateProductPage,
  getAllProductPages,
  getProductPageById,
  updateProductPageGetdonation,
  deleteProductPage,
  slideFun,
  getSlides,
  updateSlide,
  deleteSlide
};
