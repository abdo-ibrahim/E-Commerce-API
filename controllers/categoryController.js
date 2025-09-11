const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const Category = require("../models/categoryModel");
const path = require("path");
const { cloudinaryUpload, cloudinaryRemove } = require("../config/cloudinary");

/**
 * @desc   Create a new category
 * @route  POST /api/v1/categories
 * @method POST
 * @access Private/Admin
 */
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  if (!name) {
    return next(new AppError("Category name is required", 400));
  }
  if (!req.file) {
    return next(new AppError("Category image is required", 400));
  }
  const absolutePath = path.join(__dirname, "../uploads", req.file.filename);
  let image = {};
  const result = await cloudinaryUpload(absolutePath);
  image.public_id = result.public_id;
  image.url = result.url;

  const newCategory = await Category.create({
    name,
    description,
    image,
  });

  res.status(201).json({
    status: "success",
    data: {
      category: newCategory,
    },
  });
});

/**
 * @desc   Get all categories
 * @route  GET /api/v1/categories
 * @method GET
 * @access Public
 */
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: "success",
    data: {
      categories,
    },
  });
});

/**
 * @desc   Get single category by ID
 * @route  GET /api/v1/categories/:id
 * @method GET
 * @access Public
 */
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

/**
 * @desc   Update a category
 * @route  PUT /api/v1/categories/:id
 * @method PUT
 * @access Private/Admin
 */
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  if (!name) {
    return next(new AppError("Category name is required", 400));
  }

  // remove old image from cloudinary if new image is uploaded
  if (req.file && req.file.filename) {
    const existing = await Category.findById(req.params.id);
    if (existing && existing.image && existing.image.public_id) {
      await cloudinaryRemove(existing.image.public_id);
    }
  }
  let image;
  if (req.file) {
    const absolutePath = path.join(__dirname, "../uploads", req.file.filename);
    const result = await cloudinaryUpload(absolutePath);
    image = {
      public_id: result.public_id,
      url: result.url,
    };
  }
  const updatedData = {
    name,
    description,
  };
  if (image) updatedData.image = image;

  const category = await Category.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return next(new AppError("Category not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

/**
 * @desc   Delete a category
 * @route  DELETE /api/v1/categories/:id
 * @method DELETE
 * @access Private/Admin
 */
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }
  if (category.image && category.image.public_id) {
    try {
      await cloudinaryRemove(category.image.public_id);
    } catch (e) {
      console.error("Failed to remove category image from Cloudinary", e);
    }
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
