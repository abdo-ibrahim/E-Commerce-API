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

// function to update product ratings using Aggregation
async function updateProductRatings(productId) {
  const stats = await mongoose.model("reviews").aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  await Product.findByIdAndUpdate(productId, {
    averageRating: stats.length > 0 ? stats[0].averageRating : 0,
    numReviews: stats.length > 0 ? stats[0].numReviews : 0,
  });
}

// post save hook (after creating or updating a review)
reviewSchema.post("save", async function () {
  await updateProductRatings(this.product);
});

// post remove hook (after deleting a review)
reviewSchema.post("remove", async function () {
  await updateProductRatings(this.product);
});
// post findOneAndDelete hook (works with findByIdAndDelete & findOneAndDelete)
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateProductRatings(doc.product);
  }
});

const Review = mongoose.model("reviews", reviewSchema);

module.exports = Review;
