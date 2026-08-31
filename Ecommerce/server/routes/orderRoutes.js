/**
 * ShopEase - Order Routes (Phase 5)
 *
 * All routes are protected (require JWT).
 *
 *   POST /              → createOrder (checkout from cart)
 *   POST /direct        → createDirectOrder (items in request body)
 *   GET  /              → getMyOrders
 *   GET  /:id           → getMyOrder
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createOrder,
  createDirectOrder,
  getMyOrders,
  getMyOrder,
} = require('../controllers/orderController');

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.route('/').post(createOrder).get(getMyOrders);
router.post('/direct', createDirectOrder);
router.get('/:id', getMyOrder);

module.exports = router;