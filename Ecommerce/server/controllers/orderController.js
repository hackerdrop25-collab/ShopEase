const Order = require('../models/Order');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { sendResponse } = require('../utils/sendResponse');

const roundMoney = (value) => Math.round(value * 100) / 100;

exports.createOrder = catchAsync(async (req, res, next) => {
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

exports.getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Orders fetched successfully.', { orders });
});

exports.getMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  return sendResponse(res, 200, 'Order fetched successfully.', { order });
});
