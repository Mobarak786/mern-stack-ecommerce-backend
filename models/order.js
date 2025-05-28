const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  gateway: {
    type: String,
    required: true,
    enum: ["stripe", "paypal"],
  },
  paymentId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "completed",
    enum: ["pending", "completed", "failed"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
