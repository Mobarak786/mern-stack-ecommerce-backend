require("dotenv").config();
const Stripe = require("stripe");
const mongoose = require("mongoose");
const Product = require("../models/product");

const createCheckoutSession = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { productId } = req.params;

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Fetch the product by _id
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const productData = product.toObject();
    productData._id = productData._id.toString(); // Ensure _id is a string

    // CREATE STRIPE SESSION
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.productName,
              images: [product.image],
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL_PRODUCTION}/success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}`,
      cancel_url: `${process.env.CLIENT_URL_PRODUCTION}/cancel`,
      metadata: {
        productId: productId,
        productName: product.productName,
      },
    });

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({
      error: `Failed to create checkout session: ${error.message}`,
    });
  }
};

module.exports = {
  createCheckoutSession,
};
