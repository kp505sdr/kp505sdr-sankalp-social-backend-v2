const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductPage", required: true },
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: String, required: true },
    amount: { type: Number, required: true },
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    status: { type: String, default: "success" },
  },
  { timestamps: true }
);

module.exports= mongoose.model("Donation", donationSchema);
