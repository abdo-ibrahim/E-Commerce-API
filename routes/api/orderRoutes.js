const express = require("express");
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, getMyOrders, payOrder } = require("../../controllers/orderController");
const { protect } = require("../../controllers/authController");
const { allowTo } = require("../../middlewares/allowTo");
const orderRouter = express.Router();

orderRouter.post("/", protect, allowTo("User"), createOrder);
orderRouter.get("/", getAllOrders);
orderRouter.get("/my-orders", protect, allowTo("User"), getMyOrders);
orderRouter.get("/:id", protect, allowTo("User", "Admin"), getOrderById);
orderRouter.put("/:id", protect, allowTo("Admin"), updateOrderStatus);
orderRouter.put("/:id/pay", protect, allowTo("User"), payOrder);
orderRouter.delete("/:id", protect, allowTo("Admin"), deleteOrder);

module.exports = orderRouter;
