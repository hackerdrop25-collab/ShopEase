/**
 * ShopEase - Order Routes
 * Base path: /api/orders
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.get('/:id', getOrderById);

module.exports = router;
