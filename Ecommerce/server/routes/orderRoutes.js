/**
 * ShopEase - Order Routes
 * Base path: /api/orders
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById
} = require('../controllers/orderController');

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
