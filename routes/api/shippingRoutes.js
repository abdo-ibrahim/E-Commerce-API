const express = require("express");
const { allowTo } = require("../../middlewares/allowTo");
const { protect } = require("../../controllers/authController");
const { createShipping, getAllShippings, updateShipping, deleteShipping } = require("../../controllers/shippingController");

const shippingRouter = express.Router();

shippingRouter.post("/", protect, allowTo("Admin"), createShipping);
shippingRouter.get("/", getAllShippings);
shippingRouter.put("/:id", protect, allowTo("Admin"), updateShipping);
shippingRouter.delete("/:id", protect, allowTo("Admin"), deleteShipping);

module.exports = shippingRouter;
