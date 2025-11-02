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



require("dotenv").config(); // ✅ load .env file
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,       // e.g., mail.sankalpsocialtrust.org
  port: process.env.MAIL_PORT,       // e.g., 465
  secure: process.env.MAIL_SECURE === "true", // true for SSL (465)
  auth: {
    user: process.env.EMAIL_USER,    // e.g., help@sankalpsocialtrust.org
    pass: process.env.EMAIL_PASS,    // email password or app password
  },
});

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await transporter.sendMail({
      from: `"Sankalp Social Trust" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log("✅ Email sent to", to);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};

module.exports = sendEmail;

