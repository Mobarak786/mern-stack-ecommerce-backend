require("dotenv").config();
const Stripe = require("stripe");

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

const createCheckoutSession = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { productId } = req.params;
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    //CREATE A STRIPE SESSION
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
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
        productId,
        productName: product.name,
      },
    });

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res
      .status(500)
      .json({ error: `Failed to create checkout session: ${error.message}` });
  }
};

module.exports = {
  createCheckoutSession,
};
