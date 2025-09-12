const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      index: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: [true, "Image public_id is required"],
        },
        url: {
          type: String,
          required: [true, "Image url is required"],
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
productSchema.virtual("reviews", {
  ref: "reviews",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});
// text index for search
productSchema.index({ name: "text", description: "text" });

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
