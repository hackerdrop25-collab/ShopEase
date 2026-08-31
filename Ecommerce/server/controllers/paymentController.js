/**
 * ShopEase - Payment Controller (Phase 6)
 *
 * Razorpay integration:
 *  - createRazorpayOrder: Creates Razorpay order
 *  - verifyPayment: Validates signature and updates order status to 'Paid'
 */

const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { AppError, catchAsync } = require('../middleware/errorHandler');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('xxxx')) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ── CREATE RAZORPAY ORDER ───────────────────────────────────────────────────
exports.createRazorpayOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // If Razorpay keys are configured, call Razorpay API
  if (razorpayInstance) {
    const options = {
      amount: Math.round(order.totalPrice * 100), // amount in paise
      currency: 'INR',
      receipt: `order_rcptid_${order._id}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    order.paymentInfo.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(200).json({
      success: true,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.totalPrice,
      currency: 'INR',
    });
  }

  // Demo / Test Mode fallback if Razorpay keys are default or not set
  const mockRazorpayOrderId = `order_mock_${Date.now()}`;
  order.paymentInfo.razorpayOrderId = mockRazorpayOrderId;
  await order.save();

  return res.status(200).json({
    success: true,
    isMock: true,
    razorpayOrder: { id: mockRazorpayOrderId, amount: Math.round(order.totalPrice * 100) },
    keyId: 'rzp_test_mockkey123',
    amount: order.totalPrice,
    currency: 'INR',
  });
});

// ── VERIFY PAYMENT ───────────────────────────────────────────────────────────
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (razorpayInstance && razorpaySignature) {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return next(new AppError('Invalid payment signature', 400));
    }
  }

  // Update order status to paid
  order.paymentInfo.status = 'Paid';
  order.paymentInfo.paidAt = new Date();
  order.paymentInfo.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
  order.orderStatus = 'Processing';
  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Payment verified and order confirmed!',
    order,
  });
});
