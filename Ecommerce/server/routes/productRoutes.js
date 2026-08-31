/**
 * ShopEase - Product Routes (Phase 4)
 *
 * Public routes:
 *   GET  /           → getProducts   (search, filter, pagination)
 *   GET  /:id        → getProductById
 *
 * Protected routes (require JWT):
 *   POST   /         → createProduct
 *   PUT    /:id      → updateProduct
 *   DELETE /:id      → deleteProduct
 */

const express = require('express');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Public routes ────────────────────────────────────────────────────────────
router.get('/', getProducts);
router.get('/:id', getProductById);

// ── Protected routes (JWT required) ──────────────────────────────────────────
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
