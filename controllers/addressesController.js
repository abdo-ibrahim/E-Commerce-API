const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const User = require("../models/userModel");

/**
 * @desc    Add address to current logged in user
 * @route   POST /api/users/addresses
 * @method  POST
 * @access  Private
 */
exports.addUserAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({
    status: "success",
    data: user,
  });
});

/**
 * @desc    Get all addresses of current logged in user
 * @route   GET /api/users/addresses
 * @method  GET
 * @access  Private
 */
exports.getAllUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: user.addresses,
  });
});

/**
 * @desc    Update address of current logged in user
 * @route   PUT /api/users/addresses/:addressId
 * @method  PUT
 * @access  Private
 */
exports.updateUserAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    return next(new AppError("No address found with that ID", 404));
  }

  address.set(req.body);
  await user.save();

  res.status(200).json({
    status: "success",
    data: user,
  });
});

/**
 * @desc    Remove address from current logged in user
 * @route   DELETE /api/users/addresses/:addressId
 * @method  DELETE
 * @access  Private
 */
exports.removeUserAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  user.addresses.pull(req.params.addressId);
  await user.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
