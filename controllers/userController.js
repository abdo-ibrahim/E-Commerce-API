const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const User = require("../models/userModel");
const path = require("path");
const { cloudinaryUpload, cloudinaryRemove } = require("../config/cloudinary");
/**
 * @desc    Get all users
 * @route   GET /api/users
 * @@method  GET
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password -confirmPassword");
  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @method  GET
 * @access  Private/Admin
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password -confirmPassword");
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

/**
 * @desc   Update user by ID (Admin)
 * @route  PUT /api/v1/users/:id
 * @access Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const allowedFields = ["firstName", "lastName", "userName", "role", "addresses", "profilePicture"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field]) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new AppError("No user found with that ID", 404));
  res.status(200).json({ status: "success", data: user });
});
/**
 * @desc    Delete user by ID
 * @route   DELETE /api/users/:id
 * @method  DELETE
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/users/me
 * @method  GET
 * @access  Private/User
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password -confirmPassword");
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});
/**
 * @desc    Update current logged in user profile
 * @route   PUT /api/users/update-me
 * @method  PUT
 * @access  Private/User
 */
exports.updateMe = asyncHandler(async (req, res, next) => {
  const allowedFields = ["firstName", "lastName", "userName", "addresses", "profilePicture"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select("-password -confirmPassword");
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

/**
 * @desc    Update current logged in user password
 * @route   PUT /api/users/update-password
 * @method  PUT
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password +confirmPassword");
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new AppError("Please provide currentPassword, newPassword and confirmNewPassword", 400));
  }
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Your current password is incorrect", 401));
  }
  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});

/**
 * @desc    Delete current logged in user account
 * @route   DELETE /api/users/delete-me
 * @method  DELETE
 * @access  Private/User
 */
exports.deleteMe = asyncHandler(async (req, res, next) => {
  // Cascade delete: cart, wishlist, reviews, orders, profile picture
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("No user found with that ID", 404));

  const userId = user._id;

  // Require models
  const Cart = require("../models/cartModel");
  const Wishlist = require("../models/wishlistModel");
  const Review = require("../models/reviewModel");
  const Order = require("../models/orderModel");

  const tasks = [];
  // Remove profile picture from Cloudinary
  if (user.profilePicture && user.profilePicture.public_id) {
    tasks.push(cloudinaryRemove(user.profilePicture.public_id));
  }
  // Delete cart
  tasks.push(Cart.deleteOne({ user: userId }));

  // Delete wishlist
  tasks.push(Wishlist.deleteOne({ user: userId }));

  // Delete reviews
  tasks.push(Review.deleteMany({ user: userId }));

  // Delete orders
  tasks.push(Order.deleteMany({ user: userId }));

  await Promise.all(tasks);

  // Finally delete the user
  await User.deleteOne({ _id: userId });

  res.status(204).json({ status: "success", data: null });
});

/**
 * @desc    Upload user profile picture
 * @route   POST /api/users/upload-profile-picture
 * @method  POST
 * @access  Private/User
 */
exports.uploadProfilePicture = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }
  // remove old image from cloudinary
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  if (user.profilePicture && user.profilePicture.public_id) {
    await cloudinaryRemove(user.profilePicture.public_id);
  }
  const absolutePath = path.join(__dirname, "../uploads", req.file.filename);
  const result = await cloudinaryUpload(absolutePath);
  user.profilePicture = { public_id: result.public_id, url: result.url };
  await user.save();
  res.status(200).json({
    status: "success",
    data: user,
  });
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    }
  });
});
