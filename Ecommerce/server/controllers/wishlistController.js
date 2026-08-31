/**
 * ShopEase - Wishlist Controller (Phase 5)
 *
 * All routes are protected (require JWT).
 *
 *   GET    /api/wishlist                   → getWishlist
 *   POST   /api/wishlist/add               → addToWishlist
 *   DELETE /api/wishlist/remove/:productId  → removeFromWishlist
 */

const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { sendResponse } = require('../utils/sendResponse');

// ── GET WISHLIST ─────────────────────────────────────────────────────────────
const getWishlist = catchAsync(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products.product', 'title slug price comparePrice stock images rating numReviews isActive');

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [],
    });
  }

  return sendResponse(res, 200, 'Wishlist fetched successfully.', { wishlist });
});

// ── ADD TO WISHLIST ──────────────────────────────────────────────────────────
const addToWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new AppError('Product ID is required.', 400));
  }

  const product = await Product.findOne({ _id: productId, isActive: true });

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: req.user._id,
      products: [],
    });
  }

  // Use the model's built-in hasProduct method
  if (wishlist.hasProduct(productId)) {
    return next(new AppError('Product already in wishlist.', 400));
  }

  // Use the model's built-in addProduct method (saves automatically)
  await wishlist.addProduct(productId);

  await wishlist.populate('products.product', 'title slug price comparePrice stock images rating numReviews isActive');

  return sendResponse(res, 200, 'Product added to wishlist.', { wishlist });
});

// ── REMOVE FROM WISHLIST ─────────────────────────────────────────────────────
const removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError('Wishlist not found.', 404));
  }

  // Use the model's built-in removeProduct method (saves automatically)
  await wishlist.removeProduct(productId);

  await wishlist.populate('products.product', 'title slug price comparePrice stock images rating numReviews isActive');

  return sendResponse(res, 200, 'Product removed from wishlist.', { wishlist });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
