const express = require("express");
const { getAllProducts, createProduct, getProductById, updateProduct, deleteProduct } = require("../../controllers/productController");
const upload = require("../../config/fileUpload");
const { protect } = require("../../controllers/authController");
const { allowTo } = require("../../middlewares/allowTo");
const productRouter = express.Router();

productRouter.post("/", protect, allowTo("Admin"), upload.array("images", 5), createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.put("/:id", protect, allowTo("Admin"), upload.array("images", 5), updateProduct);
productRouter.delete("/:id", protect, allowTo("Admin"), deleteProduct);

module.exports = productRouter;
