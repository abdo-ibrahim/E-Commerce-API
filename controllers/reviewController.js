const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

/**
 * @desc   Create a new review for a product
 * @route  POST /api/v1/reviews
 * @method POST
 * @access Private/User
 */
exports.createReview = asyncHandler(async (req, res, next) => {
  const { productId, comment, rating } = req.body;
  const userId = req.user._id;
  if (!productId || !comment || !rating) {
    return next(new AppError("All fields are required", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // check if user purchased the product before allowing review
  const hasBought = await Order.findOne({ user: userId, "cartItems.product": productId, isDelivered: true });

  if (!hasBought) {
    return next(new AppError("You can only review products you have purchased", 403));
  }

  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    return next(new AppError("You have already reviewed this product", 400));
  }
  const newReview = await Review.create({
    product: productId,
    user: userId,
    comment,
    rating,
  });
  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: {
      review: newReview,
    },
  });
});
/**
 * @desc   Get all reviews for a product
 * @route  GET /api/v1/reviews/:productId
 * @access Public
 */
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  const reviews = await Review.find({ product: productId }).populate("user", "firstName lastName userName");
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
    averageRating: product.averageRating || 0,
    numReviews: product.numReviews || 0,
  });
});

/**
 * @desc Update a review
 * @route PUT /api/v1/reviews/:id
 * @method PUT
 * @access Private/User
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { comment, rating } = req.body;
  const userId = req.user._id;
  if (!comment || !rating) {
    return next(new AppError("All fields are required", 400));
  }
  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // check ownership
  if (review.user.toString() !== userId.toString()) {
    return next(new AppError("You can only update your own reviews", 403));
  }

  const updatedReview = await Review.findByIdAndUpdate(id, { comment, rating }, { new: true, runValidators: true });
  res.status(200).json({
    status: "success",
    message: "Review updated successfully",
    review: updatedReview,
  });
});
/**
 * @desc Delete a review
 * @route DELETE /api/v1/reviews/:id
 * @method DELETE
 * @access Private/User
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError("Review not found", 404));
  }
  // check ownership
  if (review.user.toString() !== userId.toString()) {
    return next(new AppError("You can only delete your own reviews", 403));
  }

  await Review.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    message: "Review deleted successfully",
  });
});
