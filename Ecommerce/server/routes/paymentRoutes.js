/**
 * ShopEase - Payment Routes (Placeholder)
 */

const express = require('express');
const router = express.Router();

router.post('/create-order', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment routes - Coming soon'
  });
});

module.exports = router;
