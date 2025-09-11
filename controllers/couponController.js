const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const { Coupon } = require("../models/couponModel");
const Cart = require("../models/cartModel");
const { calcTotalPrice } = require("./cartController");

/**
 * @desc   Create a new coupon
 * @route  POST /api/v1/coupons
 * @method POST
 * @access Private/Admin
 */
exports.createCoupon = asyncHandler(async (req, res, next) => {
  const { code, type, value, startsAt, expiresAt } = req.body;
  if (!code || !type || !value || !startsAt || !expiresAt) {
    return next(new AppError("All fields are required", 400));
  }
  if (new Date(startsAt) >= new Date(expiresAt)) {
    return next(new AppError("startsAt must be before expiresAt", 400));
  }
  let coupon;
  if (type === "percent") {
    coupon = await Coupon.create({ code, type, value, startsAt, expiresAt });
  } else if (type === "fixed") {
    coupon = await Coupon.create({ code, type, value, startsAt, expiresAt });
  } else {
    return next(new AppError("Invalid coupon type", 400));
  }
  res.status(201).json({
    status: "success",
    data: coupon,
  });
});

/**
 * @desc   Get all coupons
 * @route  GET /api/v1/coupons
 * @method GET
 * @access Private/Admin
 */
exports.getAllCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    status: "success",
    results: coupons.length,
    data: coupons,
  });
});

/**
 * @desc   Get coupon by code
 * @route  GET /api/v1/coupons/apply/:code
 * @method GET
 * @access Private/Admin
 */
exports.getCouponByCode = asyncHandler(async (req, res, next) => {
  const { code } = req.params;
  if (!code) {
    return next(new AppError("Coupon code is required", 400));
  }
  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }
  const now = new Date();
  const active = coupon.startsAt <= now && coupon.expiresAt >= now;
  res.status(200).json({ status: "success", active, data: coupon });
});

/**
 * @desc   Get a coupon by ID
 * @route  GET /api/v1/coupons/:id
 * @method GET
 * @access Private/Admin
 */
exports.getCouponById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: coupon,
  });
});

/**
 * @desc   Update a coupon
 * @route  PUT /api/v1/coupons/:id
 * @method PUT
 * @access Private/Admin
 */
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { code, type, value, startsAt, expiresAt } = req.body;
  if (!code || !type || !value || !startsAt || !expiresAt) {
    return next(new AppError("All fields are required", 400));
  }
  if (new Date(startsAt) >= new Date(expiresAt)) {
    return next(new AppError("startsAt must be before expiresAt", 400));
  }
  const coupon = await Coupon.findByIdAndUpdate(id, { code, type, value, startsAt, expiresAt }, { new: true, runValidators: true });
  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: coupon,
  });
});

/**
 * @desc   Delete a coupon
 * @route  DELETE /api/v1/coupons/:id
 * @method DELETE
 * @access Private/Admin
 */
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @desc   Apply a coupon
 * @route  POST /api/v1/coupons/apply/:code
 * @method POST
 * @access Private/User
 */
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.params;
  if (!code) {
    return next(new AppError("Coupon code is required", 400));
  }
  const userId = req.user.id;

  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    return next(new AppError("Invalid coupon code", 400));
  }
  const now = new Date();
  if (coupon.startsAt > now || coupon.expiresAt < now) {
    return next(new AppError("Coupon is expired or not active", 400));
  }
  const cart = await Cart.findOne({ user: userId }).populate("items.product").populate("coupons");
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const alreadyApplied = cart.coupons.some((c) => c._id.toString() === coupon._id.toString());
  if (!alreadyApplied) {
    cart.coupons.push(coupon._id);
  }
  const baseTotal = await calcTotalPrice(cart);

  let discount = 0;
  if (coupon.type === "percent") discount = (baseTotal * coupon.value) / 100;
  if (coupon.type === "fixed") discount = coupon.value;
  const finalTotal = Math.max(0, baseTotal - discount);
  cart.totalPrice = finalTotal;
  await cart.save();

  res.status(200).json({
    status: "success",
    message: alreadyApplied ? "Coupon already applied" : "Coupon applied successfully",
    data: {
      cartId: cart._id,
      items: cart.items,
      coupons: cart.coupons,
      baseTotal,
      discount,
      totalPrice: cart.totalPrice,
    },
  });
});
