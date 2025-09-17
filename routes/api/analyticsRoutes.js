const express = require("express");
const { getTopProducts, getTopCustomers, getSalesStats } = require("../../controllers/analyticsController");

const router = express.Router();

// Top 10 Products
router.get("/top-products", getTopProducts);

// Top 5 Customers
router.get("/top-customers", getTopCustomers);

// Monthly Sales Stats
router.get("/sales-stats", getSalesStats);

module.exports = router;
