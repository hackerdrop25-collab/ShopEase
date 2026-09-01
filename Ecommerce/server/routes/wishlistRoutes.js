/**
 * ShopEase - Wishlist Routes (Placeholder)
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wishlist routes - Coming soon'
  });
});

module.exports = router;
