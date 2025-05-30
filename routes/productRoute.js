const express = require("express");
const router = express.Router();
const {
  allProducts,
  postProduct,
  getProductById,
} = require("../controllers/productController");

// Get all products from the database
router.get("/allProducts", allProducts);
//post a new product to the database
router.post("/addProduct", postProduct);
// Get a product by ID
router.get("/getProduct/:id", getProductById);

module.exports = router;
