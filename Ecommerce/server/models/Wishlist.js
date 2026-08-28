/**
 * ShopEase - Wishlist Model
 *
 * Each user has exactly ONE wishlist document.
 * Stores a list of product references with the date they were added.
 *
 * Schema fields: _id, user, products[], createdAt, updatedAt
 */

const mongoose = require('mongoose');

// ── Wishlist Item Sub-Schema ──────────────────────────────────────────────────
const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Wishlist item must reference a product'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // no separate _id for sub-documents here; use product ref for lookups
);

// ── Wishlist Schema ───────────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wishlist must belong to a user'],
      unique: true, // one wishlist per user
      index: true,
    },

    products: {
      type: [wishlistItemSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 100,
        message: 'Wishlist cannot contain more than 100 products',
      },
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: Count ────────────────────────────────────────────────────────────
wishlistSchema.virtual('totalItems').get(function () {
  return this.products.length;
});

// ── Instance Method: Check if a product is already in the wishlist ────────────
wishlistSchema.methods.hasProduct = function (productId) {
  return this.products.some(
    (item) => item.product.toString() === productId.toString()
  );
};

// ── Instance Method: Add product (idempotent) ─────────────────────────────────
wishlistSchema.methods.addProduct = function (productId) {
  if (!this.hasProduct(productId)) {
    this.products.push({ product: productId });
  }
  return this.save();
};

// ── Instance Method: Remove product ──────────────────────────────────────────
wishlistSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
