const express = require("express");
const { createOrder, getOrders } = require("../controllers/orderController");

const router = express.Router();

// POST /api/order
router.get("/order", createOrder);

// GET /api/orders
router.get("/orders", getOrders);

module.exports = router;
