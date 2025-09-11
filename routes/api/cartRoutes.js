const express = require("express");
const { getCart, addItemToCart, updateCartItem, removeItemFromCart, clearCart } = require("../../controllers/cartController");
const { protect } = require("../../controllers/authController");
const { allowTo } = require("../../middlewares/allowTo");
const cartRouter = express.Router();

cartRouter.get("/", protect, allowTo("User"), getCart);
cartRouter.post("/", protect, allowTo("User"), addItemToCart);
cartRouter.put("/:productId", protect, allowTo("User"), updateCartItem);
cartRouter.delete("/clear", protect, allowTo("User"), clearCart);
cartRouter.delete("/:productId", protect, allowTo("User", "Admin"), removeItemFromCart);

module.exports = cartRouter;
