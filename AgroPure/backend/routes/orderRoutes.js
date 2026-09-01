const express = require("express");

const {
  createOrder,
  createRazorpayOrderFromCart,
  verifyAndCreateRazorpayOrder,
  getMyOrders,
  getOrderById,
  getFarmerOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Checkout / Create COD order
router.post("/", protect, createOrder);

// Razorpay: Prepare order from cart
router.post("/razorpay/create", protect, createRazorpayOrderFromCart);

// Razorpay: Verify signature & create order
router.post("/razorpay/verify", protect, verifyAndCreateRazorpayOrder);

// Customer orders
router.get("/my-orders", protect, getMyOrders);

// Farmer orders (Protected)
router.get(
  "/farmer-orders",
  protect,
  authorize("farmer", "admin"),
  getFarmerOrders
);

// Admin: all orders
router.get(
  "/all-orders",
  protect,
  authorize("admin"),
  getAllOrders
);

// Single order
router.get("/:id", protect, getOrderById);

// Admin: update order status
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateOrderStatus
);

module.exports = router;
