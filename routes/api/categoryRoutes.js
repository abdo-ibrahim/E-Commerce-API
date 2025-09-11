const express = require("express");
const { getAllCategories, createCategory, getCategoryById, updateCategory, deleteCategory } = require("../../controllers/categoryController");
const upload = require("../../config/fileUpload");
const { protect } = require("../../controllers/authController");
const { allowTo } = require("../../middlewares/allowTo");
const categoryRouter = express.Router();

categoryRouter.post("/", protect, allowTo("Admin"), upload.single("image"), createCategory);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.put("/:id", protect, allowTo("Admin"), upload.single("image"), updateCategory);
categoryRouter.delete("/:id", protect, allowTo("Admin"), deleteCategory);

module.exports = categoryRouter;
