const express = require("express");
require("dotenv").config();
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const order = new Order({
        productName:
          session?.display_items?.[0]?.custom?.name || "Unknown Product",
        amount: session.amount_total / 100,
        currency: session.currency,
        customerEmail: session.customer_details.email,
        paymentStatus: session.payment_status,
        stripeSessionId: session.id,
      });

      try {
        await order.save();
        console.log("✅ Order saved:", order._id);
      } catch (error) {
        console.error("❌ Error saving order:", error.message);
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
