const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const Shipping = require("../models/ShippingModel");

/**
 * @desc   Create new city shipping price
 * @route  POST /api/v1/shippings
 * @method POST
 * @access Private/Admin
 */
exports.createShipping = asyncHandler(async (req, res, next) => {
  const { city, price } = req.body;
  if (!city || !price) {
    return next(new AppError("All fields are required", 400));
  }
  const existingShipping = await Shipping.findOne({ city });
  if (existingShipping) {
    return next(new AppError("Shipping for this city already exists", 400));
  }
  const newShipping = await Shipping.create({ city, price: Number(price) });
  res.status(201).json({
    status: "success",
    data: newShipping,
  });
});

/**
 * @desc   Get all city shippings
 * @route  GET /api/v1/shippings
 * @method GET
 * @access Public
 */
exports.getAllShippings = asyncHandler(async (req, res, next) => {
  const shippings = await Shipping.find();
  res.status(200).json({
    status: "success",
    results: shippings.length,
    data: shippings,
  });
});

/**
 * @desc    Update an shipping
 * @route  PUT /api/v1/shippings
 * @method PUT
 * @access Private/Admin
 */
exports.updateShipping = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { city, price } = req.body;
  if (!city || !price) {
    return next(new AppError("All fields are required", 400));
  }
  const shipping = await Shipping.findByIdAndUpdate(
    id,
    { city, price },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!shipping) return next(new AppError("Shipping not found", 404));
  res.status(200).json({
    status: "success",
    data: shipping,
  });
});

/**
 * @desc    Delete an shipping
 * @route  DELETE /api/v1/shippings
 * @method DELETE
 * @access Private/Admin
 */
exports.deleteShipping = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const shipping = await Shipping.findByIdAndDelete(id);
  if (!shipping) {
    return next(new AppError("No shipping found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
