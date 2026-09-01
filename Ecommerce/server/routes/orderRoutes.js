/**
 * ShopEase - Order Routes (Placeholder)
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Order routes - Coming soon'
  });
});

module.exports = router;
