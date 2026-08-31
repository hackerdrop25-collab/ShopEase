/**
 * ShopEase - Wishlist Routes (Phase 5)
 *
 * All routes are protected (require JWT).
 *
 *   GET    /                   → getWishlist
 *   POST   /add                → addToWishlist
 *   DELETE /remove/:productId  → removeFromWishlist
 */

const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);

module.exports = router;
