const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Checkout / Create order
router.post("/", protect, createOrder);

// Customer orders
router.get("/my-orders", protect, getMyOrders);

// Single order
router.get("/:id", protect, getOrderById);

module.exports = router;
