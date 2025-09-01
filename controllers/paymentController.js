

require('dotenv').config();
const Razorpay  = require('razorpay');
const crypto  = require('crypto');
const Donation = require('../models/donationModel');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require("pdfkit");



 


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

// const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       name,
//       email,
//       mobile,
//       amount,
//       campaignId,
//     } = req.body;

//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign.toString())
//       .digest("hex");

//     if (razorpay_signature === expectedSign) {
//       // ✅ Save donation in DB
//       const donation = new Donation({
//         campaignId,
//         name,
//         email,
//         mobile,
//         amount,
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature,
//         status: "success",
//       });

//       await donation.save();

//       return res.json({
//         success: true,
//         message: "Payment verified & donation saved",
//         donation,
//       });
//     } else {
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }
//   } catch (err) {
//     console.error("Payment verification error:", err);
//     res.status(500).json({ success: false, message: "Verification failed" });
//   }
// };


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

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // ✅ Save donation in DB
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

      // ✅ Send Email to Donor
      if (email) {
        const subject = "Thank you for your donation 🙏";
        const html = `
          <h2>Hi ${name},</h2>
          <p>Thank you for supporting our campaign ❤️</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
          <br/>
          <p>We appreciate your generosity!</p>
          <p>- Team Fundraiser</p>
        `;
        await sendEmail(email, subject, html);
      }

      return res.json({
        success: true,
        message: "Payment verified & donation saved",
        donation,
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
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

    // ✅ Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Donation_Certificate_${razorpay_payment_id}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Generate PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc.fontSize(24).fillColor("green").text("Donation Certificate", { align: "center" }).moveDown(2);
    doc.fontSize(16).fillColor("black").text(`This is to certify that ${donation?.name || "Donor"}`, { align: "center" }).moveDown(1);
    doc.text(`has generously donated $${donation.amount || "N/A"} to our cause.`, { align: "center" }).moveDown(1);
    doc.text(`Transaction ID: ${donation.razorpay_payment_id}`, { align: "center" }).moveDown(1);
    doc.text(`Date: ${donation.date ? donation.date.toDateString() : "N/A"}`, { align: "center" }).moveDown(2);
    doc.fontSize(14).text("Thank you for your contribution!", { align: "center" }).moveDown(1);

    doc.end();
  } catch (error) {
    console.error("❌ Error generating certificate:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error generating certificate" });
    }
  }
};


module.exports={createOrder,verifyPayment,certiFicate}