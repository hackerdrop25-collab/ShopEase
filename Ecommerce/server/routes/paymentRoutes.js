/**
 * ShopEase - Payment Routes (Phase 6)
 *
 * Base path: /api/payment
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

router.use(protect);

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

module.exports = router;
