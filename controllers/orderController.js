require("dotenv").config(); // Load environment variables
const Order = require("../models/order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const products = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
  },
  {
    id: "3",
    name: "Laptop Stand",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300",
  },
  {
    id: "4",
    name: "USB-C Cable",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
  },
  {
    id: "5",
    name: "Bluetooth Speaker",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300",
  },
  {
    id: "6",
    name: "Phone Case",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
  },
  {
    id: "7",
    name: "Wireless Charger",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300",
  },
  {
    id: "8",
    name: "Gaming Mouse",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300",
  },
  {
    id: "9",
    name: "Mechanical Keyboard",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300",
  },
];

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
    const product = products.find((p) => p.id === product_id);
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
      productName: product.name,
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
