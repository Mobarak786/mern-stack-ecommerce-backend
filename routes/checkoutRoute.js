const express = require("express");
const { createCheckoutSession } = require("../controllers/checkoutController");

const router = express.Router();

// POST /api/checkout/:productId
router.post("/checkout/:productId", createCheckoutSession);

module.exports = router;
