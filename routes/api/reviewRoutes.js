const express = require("express");
const { getAllReviews, createReview, updateReview, deleteReview } = require("../../controllers/reviewController");
const { protect } = require("../../controllers/authController");
const { allowTo } = require("../../middlewares/allowTo");
const reviewRouter = express.Router();

reviewRouter.post("/", protect, allowTo("User"), createReview);
reviewRouter.get("/:productId", getAllReviews);
reviewRouter.put("/:id", protect, allowTo("User"), updateReview);
reviewRouter.delete("/:id", protect, allowTo("User", "Admin"), deleteReview);

module.exports = reviewRouter;
