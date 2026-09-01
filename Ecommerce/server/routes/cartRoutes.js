/**
 * ShopEase - Cart Routes (Placeholder)
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cart routes - Coming soon'
  });
});

module.exports = router;
