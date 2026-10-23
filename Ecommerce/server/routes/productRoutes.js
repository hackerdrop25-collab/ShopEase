/**
 * ShopEase - Product Routes
 */

const express = require('express');
const router = express.Router();
const {
  getAllProducts,

  getAllProductsAdmin,
  getAdminStats,
  getProductDetails,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  getProductsByCategory,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);

// Admin Analytics & Products list (must be defined BEFORE :id wildcard)
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/admin/all', protect, authorize('admin'), getAllProductsAdmin);

// Product details
router.get('/:id', getProductDetails);

// Admin management routes
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.patch('/:id/stock', protect, authorize('admin'), updateStock);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
