const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  seedProducts,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================
// PUBLIC
// ======================================

// Get products
router.get("/", getProducts);

// Seed database with organic produce
router.post("/seed", seedProducts);

// Get farmer's own products (Protected)
router.get(
  "/my-products",
  protect,
  authorize("farmer", "admin"),
  getMyProducts
);

// Get single product
router.get("/:id", getProductById);

// ======================================
// FARMER + ADMIN
// ======================================

// Create product
router.post("/", protect, authorize("farmer", "admin"), createProduct);

// Update product
router.put("/:id", protect, authorize("farmer", "admin"), updateProduct);

// Delete product
router.delete("/:id", protect, authorize("farmer", "admin"), deleteProduct);

module.exports = router;
