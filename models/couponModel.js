const mongoose = require("mongoose");

const base = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
    },
    value: {
      type: Number,
      required: [true, "Coupon value is required"],
      min: [0, "Coupon value must be at least 0"],
    },
    type: {
      type: String,
      required: [true, "Coupon type is required"],
      enum: ["percent", "fixed"],
    },
    startsAt: {
      type: Date,
      required: [true, "Start date is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", base);

module.exports = { Coupon };
