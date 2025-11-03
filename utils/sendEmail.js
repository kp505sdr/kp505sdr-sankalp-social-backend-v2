// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail", // or "smtp.yourmail.com"
//   auth: {
//     user: process.env.EMAIL_USER, // your email
//     pass: process.env.EMAIL_PASS, // app password (not your real password)
//   },
// });

// const sendEmail = async (to, subject, html) => {
//   try {
//     await transporter.sendMail({
//       from: `"Fundraiser" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });
//     console.log("✅ Email sent to", to);
//   } catch (err) {
//     console.error("❌ Email sending failed:", err);
//   }
// };

// module.exports = sendEmail;



require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const response = await resend.emails.send({
      from: `"Sankalp Social Trust" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments: attachments.map((file) => ({
        filename: file.filename,
        content: file.content, // can be Buffer or base64 string
      })),
    });

    console.log("✅ Email sent to:", to, "Response:", response.id || "no ID");
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};

module.exports = sendEmail;
