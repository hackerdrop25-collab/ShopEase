const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================
// PUBLIC
// ======================================

// Get products
router.get("/", getProducts);

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
