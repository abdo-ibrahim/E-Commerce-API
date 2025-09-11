const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const Shipping = mongoose.model("shippings", shippingSchema);

module.exports = Shipping;
