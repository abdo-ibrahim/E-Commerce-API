const express = require("express");
const { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon, applyCoupon, getCouponByCode } = require("../../controllers/couponController");
const { protect } = require("../../controllers/authController");
const { allowTo } = require("../../middlewares/allowTo");
const couponRouter = express.Router();

couponRouter.post("/", protect, allowTo("Admin"), createCoupon);
couponRouter.get("/", protect, allowTo("Admin"), getAllCoupons);
couponRouter.get("/:id", protect, allowTo("Admin"), getCouponById);
couponRouter.put("/:id", protect, allowTo("Admin"), updateCoupon);
couponRouter.delete("/:id", protect, allowTo("Admin"), deleteCoupon);
couponRouter.get("/apply/:code", protect, allowTo("Admin"), getCouponByCode);
couponRouter.post("/apply/:code", protect, allowTo("User"), applyCoupon);

module.exports = couponRouter;
