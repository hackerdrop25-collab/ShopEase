/**
 * ShopEase - Cart Routes
 * Base path: /api/cart
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
