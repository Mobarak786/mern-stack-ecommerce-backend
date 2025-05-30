const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const checkoutRoutes = require("./routes/checkoutRoute");
const orderRoutes = require("./routes/orderRoute");
const productRoutes = require("./routes/productRoute");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

//health checking route
app.get("/api", (req, res) => {
  res.send(`welcome to the API!`);
});

// Routes
app.use("/api", checkoutRoutes);
app.use("/api", orderRoutes);
app.use("/api", productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
