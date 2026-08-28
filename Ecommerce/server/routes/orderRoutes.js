const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getMyOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.use(protect);
router.route('/').post(createOrder).get(getMyOrders);
router.get('/:id', getMyOrder);

module.exports = router;