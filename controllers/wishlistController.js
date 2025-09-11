const Wishlist = require("../models/wishlistModel");
const Product = require("../models/productModel");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");

/**
 * @desc   Get current user's wishlist
 * @route  GET /api/v1/wishlist
 * @method GET
 * @access Private/user
 */
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: wishlist,
  });
});

/**
 * @desc   Add product to wishlist
 * @route  POST /api/v1/wishlist
 * @method POST
 * @access Private/user
 */
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
  } else {
    if (wishlist.products.includes(productId)) {
      return next(new AppError("Product already in wishlist", 400));
    }
    wishlist.products.push(productId);
    await wishlist.save();
  }
  res.status(200).json({
    status: "success",
    data: wishlist,
  });
});

/**
 * @desc   Remove product from wishlist
 * @route  DELETE /api/v1/wishlist/:productId
 * @method DELETE
 * @access Private/user
 */
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
  await wishlist.save();

  res.status(200).json({
    status: "success",
    data: wishlist,
  });
});
