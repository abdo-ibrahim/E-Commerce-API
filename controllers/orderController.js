const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const { calcTotalPrice } = require("./cartController");
const Shipping = require("../models/ShippingModel");

/**
 * @desc   Create a new order
 * @route  POST /api/v1/orders
 * @method POST
 * @access Private/User
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    return next(new AppError("All fields are required", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }
  console.log("cart", cart);
  const shipping = await Shipping.findOne({ city: shippingAddress.city });
  const shippingPrice = shipping ? shipping.price : 0;
  const itemsPrice = await calcTotalPrice(cart);
  const taxPrice = Number((itemsPrice * 0.14).toFixed(2)); // 14% VAT
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.items,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // await Cart.findByIdAndDelete(cart._id);
  res.status(201).json({
    status: "success",
    data: order,
    basePrice: itemsPrice,
  });
});

/**
 * @desc   Get all orders (admin)
 * @route  GET /api/v1/orders
 * @method GET
 * @access Private/Admin
 */
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "firstName lastName userName email").populate("cartItems.product");
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

/**
 * @desc   Get all orders for the logged-in user
 * @route  GET /api/v1/orders/my-orders
 * @method GET
 * @access Private/User
 */
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("cartItems.product");
  res.status(200).json({
    status: "success",
    data: orders,
  });
});

/**
 * @desc   Get single order by ID
 * @route  GET /api/v1/orders/:id
 * @method GET
 * @access Private/User/Admin
 */
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate("user", "firstName lastName userName email").populate("cartItems.product");
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: order,
  });
});

/**
 * @desc   Update order status
 * @route  PUT /api/v1/orders/:id
 * @method PUT
 * @access Private/Admin
 */
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { orderStatus } = req.body;
  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  order.orderStatus = orderStatus || order.orderStatus;

  if (orderStatus === "delivered") {
    order.deliveredAt = Date.now();
    order.isDelivered = true;
  }
  await order.save();
  res.status(200).json({
    status: "success",
    data: order,
  });
});

/**
 * @desc   Mark order as paid
 * @route  PUT /api/v1/orders/:id/pay
 * @method PUT
 * @access Private/User
 */
exports.payOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  await order.save();
  res.status(200).json({
    status: "success",
    data: order,
  });
});

/**
 * @desc   Delete an order
 * @route  DELETE /api/v1/orders/:id
 * @method DELETE
 * @access Private/Admin
 */
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
