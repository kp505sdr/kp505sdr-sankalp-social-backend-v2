

require('dotenv').config();
const Razorpay  = require('razorpay');
const crypto  = require('crypto');
const Donation = require('../models/donationModel');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require("pdfkit");
const path = require("path");
const { updateProductPageGetdonation } = require('./productPageController');


 


// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// ------------------- Create Order -------------------
const createOrder= async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = "receipt#1" } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};







// -----------------------------------------------------------------------------------------------





const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      mobile,
      amount,
      campaignId,
    } = req.body;

  
    // Create expected signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

   

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature - Keys might be wrong or data mismatch",
      });
    }

    // Save donation
    const donation = new Donation({
      campaignId,
      name,
      email,
      mobile,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "success",
    });

    await donation.save();
    

    // if (email) {
    //   await sendEmail(
    //     email,
    //     "Thank you for your donation 🙏",
    //     `
    //       <h2>Hi ${name},</h2>
    //       <p>Thank you for supporting our campaign ❤️</p>
    //       <p><strong>Amount:</strong> ₹${amount}</p>
    //       <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
    //       <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
    //       <br/>
    //       <p>We appreciate your generosity!</p>
    //       <p>- Team Fundraiser</p>
    //     `
    //   );
    // }

    return res.json({
      success: true,
      message: "Payment verified & donation saved",
      donation,
    });

  } catch (err) {
    console.error("❌ Payment verification error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};


const certiFicate = async (req, res) => {
  try {
    const { razorpay_payment_id } = req.params;

    if (!razorpay_payment_id) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    const donation = await Donation.findOne({ razorpay_payment_id });
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Donation_Certificate_${razorpay_payment_id}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Generate PDF
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    // Header
    doc.fontSize(10).text(`Darpan Id: UP/2024/0472580`, { align: "left" });
    doc.fontSize(10).text(`Reg: 202400933010232`, { align: "right" });

    // Logo
    const logoPath = path.join(__dirname, "../assets/logo.png");
    try {
      doc.image(logoPath, doc.page.width / 2 - 30, 50, { width: 60 });
    } catch (e) {
      console.log("⚠ Logo not found, skipping...");
    }

    doc.moveDown(4);

    // Trust Name
    doc.fontSize(24).fillColor("#008073").font("Helvetica-BoldOblique")
      .text("Sankalp Social Trust", { align: "center" });

    doc.moveDown(0.5);

    // Address
    doc.fontSize(11).fillColor("gray")
      .text("Tetari Bazar, Siddharth Nagar, Uttar Pradesh - 272207", { align: "center" });

    doc.moveDown(1);

    // Title
    doc.fontSize(18).fillColor("#000").font("Helvetica-Bold")
      .text("Donation Certificate", { align: "center" });

    doc.moveDown(2);

    // Message
    doc.fontSize(12).fillColor("black")
      .text(`Dear ${donation.name || "Donor"},`, { align: "left" })
      .moveDown(0.5);

    doc.text(
      `Thank you for your generosity! On behalf of Sankalp Social Trust, we sincerely appreciate your support. Your donation of Rs. ${donation.amount || "N/A"} has made a meaningful impact on our mission.`,
      { align: "justify" }
    ).moveDown(2);

    // Details Table
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 250;

    const formatDate = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const addRow = (label, value) => {
      doc.font("Helvetica-Bold").fontSize(11).text(label, col1X, doc.y, { continued: true });
      doc.font("Helvetica").text(value, col2X, doc.y);
      doc.moveDown(0.7);
    };

    doc.rect(col1X - 5, tableTop - 5, 500, 90).stroke();
    addRow("Donation Date:", formatDate(donation.createdAt));
    addRow("Donation Amount:", `Rs. ${donation.amount || "N/A"}`);
    addRow("Payment Id:", donation.razorpay_payment_id);
    addRow("Event Id:", donation._id.toString());

    doc.moveDown(3);

    // Website link
    doc.fillColor("blue").fontSize(12)
      .text("www.sankalpsocialtrust.org", { align: "center", link: "http://www.sankalpsocialtrust.org" });

    doc.moveDown(1);

    // Signature
    doc.fillColor("black").fontSize(11).text("Digitally Signed", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("❌ Error generating certificate:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error generating certificate" });
    }
  }
};


module.exports={createOrder,verifyPayment,certiFicate}
