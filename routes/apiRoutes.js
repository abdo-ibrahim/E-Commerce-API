const express = require("express");

const router = express.Router();
const baseURL = "/api/v1";

const authRouter = require("./api/authRoutes");
const productRouter = require("./api/productRoutes");
const reviewRouter = require("./api/reviewRoutes");
const categoryRouter = require("./api/categoryRoutes");
const cartRouter = require("./api/cartRoutes");
const couponRouter = require("./api/couponRoutes");
const orderRouter = require("./api/orderRoutes");
const shippingRouter = require("./api/shippingRoutes");
const userRouter = require("./api/userRoutes");
const wishlistRouter = require("./api/wishlistRoutes");

router.use(`${baseURL}/auth`, authRouter);
router.use(`${baseURL}/products`, productRouter);
router.use(`${baseURL}/reviews`, reviewRouter);
router.use(`${baseURL}/categories`, categoryRouter);
router.use(`${baseURL}/cart`, cartRouter);
router.use(`${baseURL}/coupons`, couponRouter);
router.use(`${baseURL}/orders`, orderRouter);
router.use(`${baseURL}/shippings`, shippingRouter);
router.use(`${baseURL}/users`, userRouter);
router.use(`${baseURL}/wishlist`, wishlistRouter);

module.exports = router;
