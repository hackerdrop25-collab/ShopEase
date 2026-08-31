/**
 * ShopEase - Cart Routes (Phase 5)
 *
 * All routes are protected (require JWT).
 *
 *   GET    /             → getCart
 *   POST   /add          → addToCart
 *   PUT    /update/:productId → updateCartItem
 *   DELETE /remove/:productId → removeFromCart
 *   DELETE /clear        → clearCart
 */

const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update/:productId', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
