const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// function to update product ratings
async function updateProductRatings(productId) {
  const reviews = await Review.find({ product: productId });
  const ratings = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(productId, { ratings, numOfReviews });
}

// post save hook (after creating or updating a review)
reviewSchema.post("save", async function () {
  await updateProductRatings(this.product);
});

// post remove hook (after deleting a review)
reviewSchema.post("remove", async function () {
  await updateProductRatings(this.product);
});

const Review = mongoose.model("reviews", reviewSchema);

module.exports = Review;
