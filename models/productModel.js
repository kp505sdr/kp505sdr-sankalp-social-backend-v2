const mongoose = require("mongoose");

const ProductPageSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String},
    youtubeURL: { type: String },
    campaignImages: [{ type: String }],
    category: { type: String, },
    status:{ type: String, default:"Active" },
    preority: { type: String, },
      goalAmount: { type: Number,},

    donation: {
      raised: { type: Number, default: 0 },
      progressPercent: { type: Number,default: 0}, 
      donors: [
        {
          name: { type: String },
          email: { type: String },
          mobile: { type: String },
          amount: { type: Number },
          transactionId: { type: String },
          id: { type: String },
          donatedAt: { type: Date, default: Date.now },
        },
      ],
    },

    sections:[
      {
        description: { type: String,},
        image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

ProductPageSchema.pre("save", function (next) {
  if (this.donation && this.donation.goalAmount > 0) {
    this.donation.progressPercent = Math.min(
      100,
      (this.donation.raised / this.donation.goalAmount) * 100
    );
  } else {
    this.donation.progressPercent = 0;
  }
  next();
});

module.exports = mongoose.model("ProductPage", ProductPageSchema);
