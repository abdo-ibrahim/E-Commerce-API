const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");

// calc total price
exports.calcTotalPrice = async (cart) => {
  await cart.populate("items.product", "price");
  cart.totalPrice = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  await cart.save();
  return cart.totalPrice;
};

/**
 * @desc   Get current user's cart
 * @route  GET /api/v1/cart
 * @method GET
 * @access Private/user
 */
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

/**
 * @desc   Add item to cart
 * @route  POST /api/v1/cart
 * @method POST
 * @access Private/user
 */
exports.addItemToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity || quantity < 1) {
    return next(new AppError("Product ID and valid quantity are required", 400));
  }
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity }] });
  } else {
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex > -1) {
      // product exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // product does not exist in cart, add new item
      cart.items.push({ product: productId, quantity });
    }
  }
  await exports.calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

/**
 * @desc   Update item quantity in cart
 * @route  PUT /api/v1/cart/:productId
 * @method PUT
 * @access Private/user
 */
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;
  if (!productId || !quantity || quantity < 1) {
    return next(new AppError("Product ID and valid quantity are required", 400));
  }
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) {
    return next(new AppError("Product not in cart", 404));
  }
  cart.items[itemIndex].quantity = quantity;
  await exports.calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});
/**
 * @desc   Remove item from cart
 * @route  DELETE /api/v1/cart/:productId
 * @method DELETE
 * @access Private/user
 */
exports.removeItemFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await exports.calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

/**
 * @desc   Clear cart
 * @route  DELETE /api/v1/cart/clear
 * @method DELETE
 * @access Private/user
 */
exports.clearCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart cleared",
  });
});
