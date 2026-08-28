/**
 * ShopEase - Cart Model
 *
 * Each user has exactly ONE cart document.
 * The cart stores an array of cart items (product + quantity + snapshot of price).
 *
 * Schema fields: _id, user, items[], totalPrice, totalItems,
 *                appliedCoupon, discount, createdAt, updatedAt
 *
 * Item sub-schema: product (ref), quantity, price (snapshot at add-time)
 *
 * Instance methods:
 *  - recalculate() → updates totalPrice and totalItems
 */

const mongoose = require('mongoose');

// ── Cart Item Sub-Schema ──────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Cart item must reference a product'],
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1,   'Quantity must be at least 1'],
      max: [100, 'Quantity cannot exceed 100 per item'],
      default: 1,
    },

    // Price snapshot at the time of adding to cart
    // This protects against price changes affecting in-cart items
    price: {
      type: Number,
      required: [true, 'Item price snapshot is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Product title snapshot (for display even if product is updated)
    title: {
      type: String,
      required: true,
    },

    // Primary image snapshot
    image: {
      type: String,
      default: '',
    },
  },
  {
    _id: true,  // each cart item gets its own _id (needed for PUT/DELETE /api/cart/:itemId)
    timestamps: false,
  }
);

// ── Cart Schema ───────────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true, // one cart per user
      index: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    // Coupon applied to this cart
    appliedCoupon: {
      code:     { type: String, uppercase: true, trim: true },
      discount: { type: Number, default: 0, min: 0 }, // discount amount in ₹
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Total number of unique product types in the cart */
cartSchema.virtual('totalItems').get(function () {
  return this.items.length;
});

/** Total quantity across all items */
cartSchema.virtual('totalQuantity').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

/** Total price (sum of price × quantity for each item) */
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

/** Total after discount coupon */
cartSchema.virtual('totalPrice').get(function () {
  const discount = this.appliedCoupon?.discount || 0;
  return Math.max(0, this.subtotal - discount);
});

// ── Instance Method: Clear all items ─────────────────────────────────────────
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.appliedCoupon = { code: undefined, discount: 0 };
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
