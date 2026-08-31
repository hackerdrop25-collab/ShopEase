/**
 * ShopEase - Order Controller (Phase 5)
 *
 * Protected (require JWT):
 *   POST /api/orders                → createOrder  (checkout from cart)
 *   POST /api/orders/direct         → createDirectOrder (from request body — original Phase 2 flow)
 *   GET  /api/orders                → getMyOrders
 *   GET  /api/orders/:id            → getMyOrder
 */

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { sendResponse } = require('../utils/sendResponse');

const roundMoney = (value) => Math.round(value * 100) / 100;

// ── CREATE ORDER FROM CART (Phase 5 checkout flow) ───────────────────────────
exports.createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, paymentMethod = 'cod' } = req.body;

  // Validate shipping address
  const requiredAddressFields = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
  const missingAddressField = requiredAddressFields.find(
    (field) => !shippingAddress?.[field]
  );

  if (missingAddressField) {
    return next(new AppError(`Shipping ${missingAddressField} is required.`, 400));
  }

  if (!['cod', 'razorpay'].includes(paymentMethod)) {
    return next(new AppError('Payment method must be cod or razorpay.', 400));
  }

  // Fetch user's cart with populated product data
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product');

  if (!cart || cart.items.length === 0) {
    return next(new AppError('Cart is empty. Add products before checkout.', 400));
  }

  // Build order items and validate stock
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      return next(
        new AppError(`Product "${item.title}" is no longer available.`, 400)
      );
    }

    if (item.quantity > product.stock) {
      return next(
        new AppError(
          `"${product.title}" does not have enough stock. Available: ${product.stock}, requested: ${item.quantity}.`,
          400
        )
      );
    }

    const lineTotal = roundMoney(product.price * item.quantity);
    itemsPrice += lineTotal;

    orderItems.push({
      product: product._id.toString(),
      title: product.title,
      image: product.images?.[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
      itemTotal: lineTotal,
    });
  }

  itemsPrice = roundMoney(itemsPrice);
  const shippingPrice = itemsPrice > 500 ? 0 : 40;  // free shipping above ₹500
  const taxPrice = roundMoney(itemsPrice * 0.18);     // 18% GST
  const discount = cart.appliedCoupon?.discount || 0;
  const totalPrice = roundMoney(itemsPrice + shippingPrice + taxPrice - discount);

  // Create the order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress: {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      country: shippingAddress.country || 'India',
    },
    paymentInfo: { method: paymentMethod },
    itemsPrice,
    taxPrice,
    shippingPrice,
    discount,
    totalPrice,
  });

  // Reduce stock for each product
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear the cart after successful order
  await cart.clearCart();

  return sendResponse(res, 201, 'Order created successfully.', { order });
});

// ── CREATE DIRECT ORDER (original Phase 2 flow — items from request body) ────
exports.createDirectOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new AppError('Order must contain at least one item.', 400));
  }

  const requiredAddressFields = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
  const missingAddressField = requiredAddressFields.find(
    (field) => !shippingAddress?.[field]
  );

  if (missingAddressField) {
    return next(new AppError(`Shipping ${missingAddressField} is required.`, 400));
  }

  if (!['cod', 'razorpay'].includes(paymentMethod)) {
    return next(new AppError('Payment method must be cod or razorpay.', 400));
  }

  const orderItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);

    if (!item.product || !item.title || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1) {
      throw new AppError('Each order item needs a product, title, valid price, and quantity.', 400);
    }

    return {
      product: String(item.product),
      title: String(item.title),
      image: item.image ? String(item.image) : '',
      price: roundMoney(price),
      quantity,
      itemTotal: roundMoney(price * quantity),
    };
  });

  const itemsPrice = roundMoney(orderItems.reduce((sum, item) => sum + item.itemTotal, 0));
  const shippingPrice = itemsPrice > 0 ? 12 : 0;
  const taxPrice = roundMoney(itemsPrice * 0.08);
  const totalPrice = roundMoney(itemsPrice + shippingPrice + taxPrice);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress: {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      country: shippingAddress.country || 'India',
    },
    paymentInfo: { method: paymentMethod },
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  return sendResponse(res, 201, 'Order created successfully.', { order });
});

// ── GET MY ORDERS ────────────────────────────────────────────────────────────
exports.getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Orders fetched successfully.', { orders });
});

// ── GET SINGLE ORDER ─────────────────────────────────────────────────────────
exports.getMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  return sendResponse(res, 200, 'Order fetched successfully.', { order });
});
