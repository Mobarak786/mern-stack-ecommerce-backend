require("dotenv").config(); // Load environment variables
const Order = require("../models/order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/product");

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables");
  process.exit(1); // Exit if key is missing
}

const createOrder = async (req, res) => {
  const { session_id, product_id } = req.query;

  // Validate query parameters
  if (!session_id || !product_id) {
    return res
      .status(400)
      .json({ error: "Session ID and Product ID are required" });
  }

  try {
    // Retrieve the Stripe Checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Verify payment status
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Find the product
    const product = await Product.findById({ _id: product_id });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if order already exists for this session
    const existingOrder = await Order.findOne({ paymentId: session_id });
    if (existingOrder) {
      return res.json({
        success: true,
        order: existingOrder,
        message: "Order already exists",
      });
    }

    // Create new order
    const order = new Order({
      productId: product_id,
      productName: product.productName,
      amount: product.price,
      gateway: "stripe",
      paymentId: session_id,
      customerEmail: session.customer_details?.email || null,
      paymentIntentId: session.payment_intent,
      createdAt: new Date(),
      status: "completed",
    });

    await order.save();

    res.status(201).json({
      success: true,
      order: {
        id: order.paymentId,
        productName: order.productName,
        price: order.amount,
        customerEmail: order.customerEmail,
        status: order.status,
      },
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ error: `Failed to create order: ${error.message}` });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: `Failed to fetch orders: ${error.message}` });
  }
};

module.exports = {
  createOrder,
  getOrders,
};
