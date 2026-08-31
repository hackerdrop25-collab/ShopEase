/**
 * ShopEase - Cart Controller (Phase 5)
 *
 * All routes are protected (require JWT).
 *
 *   GET    /api/cart                  → getCart
 *   POST   /api/cart/add              → addToCart
 *   PUT    /api/cart/update/:productId → updateCartItem
 *   DELETE /api/cart/remove/:productId → removeFromCart
 *   DELETE /api/cart/clear            → clearCart
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { sendResponse } = require('../utils/sendResponse');

// ── GET CART ──────────────────────────────────────────────────────────────────
const getCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'title slug price stock images isActive');

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  return sendResponse(res, 200, 'Cart fetched successfully.', { cart });
});

// ── ADD TO CART ───────────────────────────────────────────────────────────────
const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return next(new AppError('Product ID is required.', 400));
  }

  const product = await Product.findOne({ _id: productId, isActive: true });

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError('Insufficient stock.', 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
    });
  }

  // Check if product already in cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + Number(quantity);

    if (newQuantity > product.stock) {
      return next(new AppError('Requested quantity exceeds available stock.', 400));
    }

    existingItem.quantity = newQuantity;
    // Update snapshot data in case product info changed
    existingItem.price = product.price;
    existingItem.title = product.title;
    existingItem.image = product.images?.[0]?.url || '';
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      price: product.price,
      title: product.title,
      image: product.images?.[0]?.url || '',
    });
  }

  await cart.save();
  await cart.populate('items.product', 'title slug price stock images isActive');

  return sendResponse(res, 200, 'Product added to cart.', { cart });
});

// ── UPDATE CART ITEM ─────────────────────────────────────────────────────────
const updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    return next(new AppError('Quantity must be at least 1.', 400));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  if (quantity > product.stock) {
    return next(new AppError('Insufficient stock.', 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found.', 404));
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    return next(new AppError('Product not found in cart.', 404));
  }

  item.quantity = Number(quantity);

  await cart.save();
  await cart.populate('items.product', 'title slug price stock images isActive');

  return sendResponse(res, 200, 'Cart updated successfully.', { cart });
});

// ── REMOVE FROM CART ─────────────────────────────────────────────────────────
const removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found.', 404));
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  await cart.populate('items.product', 'title slug price stock images isActive');

  return sendResponse(res, 200, 'Product removed from cart.', { cart });
});

// ── CLEAR CART ───────────────────────────────────────────────────────────────
const clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found.', 404));
  }

  await cart.clearCart(); // uses the instance method from the Cart model

  return sendResponse(res, 200, 'Cart cleared successfully.');
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
