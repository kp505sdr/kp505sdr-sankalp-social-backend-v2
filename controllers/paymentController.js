

require('dotenv').config();
const Razorpay  = require('razorpay');
const crypto  = require('crypto');
const Donation = require('../models/donationModel');
const Certificate80=require('../models/certificateModel');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require("pdfkit");
const path = require("path");
const { Buffer } = require("buffer");


const fs = require("fs");
const pdf = require("html-pdf");


 


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




// ------------------------------send---certificate-by email--------------------

const sendCertificate = async (req, res) => {
  try {
    const { razorpay_payment_id } = req.params;

    if (!razorpay_payment_id) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    const donation = await Donation.findOne({ razorpay_payment_id });
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Generate PDF in memory
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      // Email HTML content
      const html = `
        <p>Dear ${donation.name || "Donor"},</p>
        <p>Thank you for your generous donation of <b>Rs. ${donation.amount}</b> to <b>Sankalp Social Trust</b>.</p>
        <p>Please find attached your official donation certificate.</p>
        <p>Best regards,<br/>Sankalp Social Trust</p>
      `;

      // Send email with Resend
      await sendEmail(
        donation.email,
        "Your Donation Certificate - Sankalp Social Trust",
        html,
        [
          {
            filename: `Donation_Certificate_${razorpay_payment_id}.pdf`,
            content: pdfData.toString("base64"), // convert to base64 for Resend
          },
        ]
      );

      res.json({ message: "Certificate emailed successfully!" });
    });

    // --- PDF Content ---
    doc.fontSize(10).text(`Darpan Id: UP/2024/0472580`, { align: "left" });
    doc.fontSize(10).text(`Reg: 202400933010232`, { align: "right" });

    // Logo
    const logoPath = path.join(__dirname, "../assets/logo.png");
    try {
      doc.image(logoPath, doc.page.width / 2 - 30, 50, { width: 60 });
    } catch {
      console.log("⚠ Logo not found, skipping...");
    }

    doc.moveDown(4);
    doc.fontSize(24).fillColor("#008073").font("Helvetica-BoldOblique")
      .text("Sankalp Social Trust", { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("gray")
      .text("Tetari Bazar, Siddharth Nagar, Uttar Pradesh - 272207", { align: "center" });

    doc.moveDown(1);
    doc.fontSize(18).fillColor("#000").font("Helvetica-Bold")
      .text("Donation Certificate", { align: "center" });

    doc.moveDown(2);
    doc.fontSize(12).fillColor("black")
      .text(`Dear ${donation.name || "Donor"},`, { align: "left" })
      .moveDown(0.5);

    doc.text(
      `Thank you for your generosity! On behalf of Sankalp Social Trust, we sincerely appreciate your support. Your donation of Rs. ${donation.amount || "N/A"} has made a meaningful impact on our mission.`,
      { align: "justify" }
    ).moveDown(2);

    const col1X = 50;
    const col2X = 250;
    const tableTop = doc.y;

    const formatDate = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}/${d.getFullYear()}`;
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
    doc.fillColor("blue").fontSize(12)
      .text("www.sankalpsocialtrust.org", {
        align: "center",
        link: "http://www.sankalpsocialtrust.org",
      });

    doc.moveDown(1);
    doc.fillColor("black").fontSize(11).text("Digitally Signed", { align: "center" });
    doc.end();
  } catch (error) {
    console.error("❌ Error generating certificate:", error);
    res.status(500).json({ message: "Server error generating certificate" });
  }
};



// ------------------------send-80certificate--------------------------------------------







const send80gCertificate = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      donorAddress,
      donorMobile,
      donationAmount,
      purpose,
      paymentMode,
      genratedBy,
    } = req.body;

    // Save to DB
    const cert = new Certificate80({
      donorName,
      donorEmail,
      donorAddress,
      donorMobile,
      donationAmount,
      purpose,
      paymentMode,
      genratedBy,
    });
    await cert.save();

    // Load logo and convert to Base64
    const logoPath = path.join(__dirname, "../assets/logo.png");
    const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });

    // --- Your same design ---
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>80G Donation Certificate</title>
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              background: #fff;
              padding: 40px;
              color: #111827;
            }
            .certificate {
              border: 1px solid #d1d5db;
              padding: 30px 50px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.05);
              max-width: 700px;
              margin: auto;
              text-align: center;
            }
            .logo {
              width: 80px;
              margin-bottom: 10px;
            }
            h1 {
              color: #0f766e;
              font-size: 24px;
              margin: 0;
            }
            h2 {
              color: #0f766e;
              font-size: 20px;
              margin-top: 30px;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
              margin: 8px 0;
            }
            .info {
              text-align: left;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 20px;
              margin-top: 20px;
              font-size: 15px;
            }
            .footer {
              margin-top: 30px;
              font-size: 13px;
              color: #555;
            }
            .highlight {
              font-weight: 600;
              color: #111827;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <img src="data:image/png;base64,${logoBase64}" alt="Logo" class="logo" />
            <h1>Sankalp Social Trust</h1>
            <p>Tetari Bazar, Siddharth Nagar, Uttar Pradesh - 272207</p>
            <p><strong>PAN:</strong> ABKTS4994E &nbsp; | &nbsp; <strong>80G URN No:</strong> ABKTS4994EF20251</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #d1d5db;" />
            <h2>80G Donation Certificate</h2>
            <p><em>This is to certify that <span class="highlight">${donorName}</span> has generously donated a sum of ₹${donationAmount} towards the <strong>${purpose}</strong> supported by Sankalp Social Trust.</em></p>

            <div class="info">
              <p><strong>Receipt No:</strong> ${cert._id}</p>
              <p><strong>Transaction ID:</strong> N/A</p>
              <p><strong>Donation Amount:</strong> ₹${donationAmount}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Donor Mobile:</strong> ${donorMobile}</p>
              <p><strong>Donor Email:</strong> ${donorEmail}</p>
              <p><strong>Donor Address:</strong> ${donorAddress}</p>
              <p><strong>Payment Mode:</strong> ${paymentMode || "Cash"}</p>
            </div>

            <p class="footer">
              This donation qualifies for deduction under Section 80G of the Income Tax Act, 1961.
              Please retain this certificate for your records.
            </p>

            <p style="font-size: 13px; margin-top: 10px;">
              <strong>This is a system-generated certificate. No signature is required.</strong>
            </p>
             <p style="font-size: 10px; margin-top: 10px  color: #094fe7ff;">
              <strong>help@sankalpsocialtrust.org | +91- 8115784664</strong>
            </p>
          </div>
        </body>
      </html>
    `;

    // Generate PDF using html-pdf
    pdf.create(htmlContent, { format: "A4" }).toBuffer(async (err, buffer) => {
      if (err) {
        console.error("❌ PDF generation failed:", err);
        return res.status(500).json({ error: "PDF generation failed" });
      }

      try {
        const emailHtml = `
          <p>Dear ${donorName},</p>
          <p>Thank you for your generous donation of ₹${donationAmount} towards <strong>${purpose}</strong>.</p>
          <p>Please find attached your official 80G Donation Certificate.</p>
          <br/>
          <p>Warm regards,<br/>Sankalp Social Trust</p>
        `;

        await sendEmail(
          donorEmail,
          "Your 80G Donation Certificate",
          emailHtml,
          [
            {
              filename: "80G-Certificate.pdf",
              content: buffer,
            },
          ]
        );

        res.json({ message: "✅ Certificate saved & emailed successfully!" });
      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError);
        res.status(500).json({ error: "Email sending failed" });
      }
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};



















module.exports={createOrder,verifyPayment,certiFicate,sendCertificate,send80gCertificate}
