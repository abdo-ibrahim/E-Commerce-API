const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const AppError = require("../utils/appErrors");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc   Get top 10 best-selling products
 * @route  GET /api/v1/analytics/top-products
 * @method GET
 * @access Private/Admin
 */
exports.getTopProducts = asyncHandler(async (req, res, next) => {
  const topProducts = await Order.aggregate([
    { $unwind: "$cartItems" },
    {
      $group: {
        _id: "$cartItems.product",
        totalSold: { $sum: "$cartItems.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        productName: "$product.name",
        totalSold: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: topProducts.length,
    data: topProducts,
  });
});

/**
 * @desc   Get Top 10 customers
 * @route  GET /api/v1/analytics/top-customers
 * @method GET
 * @access Private/Admin
 */
exports.getTopCustomers = asyncHandler(async (req, res, next) => {
  const topCustomers = await Order.aggregate([
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$totalPrice" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        customerId: "$user._id",
        name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
        email: "$user.email",
        totalSpent: 1,
        ordersCount: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: topCustomers.length,
    data: topCustomers,
  });
});

/**
 * @desc   Get Monthly Sales Stats
 * @route  GET /api/v1/analytics/sales-stats
 * @method GET
 * @access Private/Admin
 */
exports.getSalesStats = asyncHandler(async (req, res, next) => {
  const salesStats = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalOrders: { $sum: 1 },
        totalSales: { $sum: "$totalPrice" },
        averageOrderValue: { $avg: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        month: "$_id",
        totalOrders: 1,
        totalSales: 1,
        averageOrderValue: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: salesStats.length,
    data: salesStats,
  });
});
