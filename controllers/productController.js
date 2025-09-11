const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const Product = require("../models/productModel");
const path = require("path");
const { cloudinaryUpload, cloudinaryRemove, cloudinaryRemoveMultiple, cloudinaryUploadMultiple } = require("../config/cloudinary");
require("../models/reviewModel");
require("dotenv").config();
/**
 * @desc   Create a new product
 * @route  POST /api/v1/products
 * @method POST
 * @access Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;
  if (!name || !description || !price || !category || !stock) {
    return next(new AppError("All fields are required", 400));
  }
  const images = Array.isArray(req.files) ? req.files : [];

  const cloudinaryImages = images.length
    ? await Promise.all(
        images.map(async (file) => {
          const absolutePath = path.join(__dirname, "../uploads", file.filename);
          const result = await cloudinaryUpload(absolutePath);
          return { public_id: result.public_id, url: result.url };
        })
      )
    : [];

  const newProduct = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    stock: Number(stock),
    images: cloudinaryImages,
  });
  res.status(201).json({
    status: "success",
    data: newProduct,
  });
});

/**
 * @desc   Get all products
 * @route  GET /api/v1/products
 * @method GET
 * @access Public
 */
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, category, minPrice, maxPrice } = req.query;
  let filter = {};
  if (category) {
    filter.category = category;
  }
  if (minPrice) {
    filter.price = { ...filter.price, $gte: minPrice };
  }
  if (maxPrice) {
    filter.price = { ...filter.price, $lte: maxPrice };
  }
  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate({ path: "reviews", select: "comment rating createdAt user", populate: { path: "user", select: "firstName lastName userName" } });
  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});

/**
 * @desc   Get single product by ID
 * @route  GET /api/v1/products/:id
 * @method GET
 * @access Public
 */
exports.getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate({ path: "reviews", select: "comment rating createdAt user", populate: { path: "user", select: "firstName lastName userName" } });
  if (!product) return next(new AppError("Product not found", 404));
  res.status(200).json({ status: "success", data: product });
});

/**
 * @desc   Update a product
 * @route  PUT /api/v1/products/:id
 * @method PUT
 * @access Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, category, stock } = req.body;
  if (!name || !description || !price || !category || !stock) {
    return next(new AppError("All fields are required", 400));
  }

  const existingProduct = await Product.findById(id);
  if (!existingProduct) return next(new AppError("Product not found", 404));

  // If new images uploaded: remove old ones from Cloudinary
  if (req.files && req.files.length) {
    if (existingProduct.images && existingProduct.images.length) {
      await cloudinaryRemoveMultiple(existingProduct.images.map((img) => img.public_id));
    }
  }

  // Upload new images to Cloudinary if provided
  let cloudinaryImages = [];
  if (req.files && req.files.length) {
    cloudinaryImages = await Promise.all(
      req.files.map(async (file) => {
        const absolutePath = path.join(__dirname, "../uploads", file.filename);
        const result = await cloudinaryUpload(absolutePath);
        return { public_id: result.public_id, url: result.url };
      })
    );
  }

  const updatedData = {
    name,
    description,
    price: Number(price),
    category,
    stock: Number(stock),
  };

  if (cloudinaryImages.length) {
    updatedData.images = cloudinaryImages;
  }
  const product = await Product.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });
  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    status: "success",
    data: product,
  });
});

/**
 * @desc   Delete a product
 * @route  DELETE /api/v1/products/:id
 * @method DELETE
 * @access Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) return next(new AppError("Product not found", 404));
  if (product.images && product.images.length) {
    await cloudinaryRemoveMultiple(product.images.map((img) => img.public_id));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
