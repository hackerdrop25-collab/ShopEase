/**
 * ShopEase - Routes Index (Barrel File)
 *
 * All API route modules are mounted here and exported as a single router
 * to be used by app.js.
 *
 * Routes will be fully wired in their respective phases:
 *  Phase 3 → auth routes
 *  Phase 4 → product routes
 *  Phase 5 → cart, wishlist, order routes
 *  Phase 6 → payment routes
 */

const express = require('express');
const router = express.Router();

// ── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShopEase API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── Phase 3: Auth Routes ─────────────────────────────────────────────────────
router.use('/auth', require('./authRoutes'));

// ── Phase 4: Product Routes ──────────────────────────────────────────────────
router.use('/products', require('./productRoutes'));

// ── Phase 5: Cart / Wishlist / Order Routes ──────────────────────────────────
router.use('/cart', require('./cartRoutes'));
router.use('/wishlist', require('./wishlistRoutes'));
router.use('/orders', require('./orderRoutes'));

// ── Phase 6: Payment Routes ──────────────────────────────────────────────────
// router.use('/payment', require('./paymentRoutes'));

module.exports = router;
