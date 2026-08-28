/**
 * ShopEase - Review Model
 *
 * Embedded within the Product model's reviews array AND stored as a
 * separate collection for easier querying, aggregation, and updates.
 *
 * Schema fields: _id, product, user, rating, title, comment,
 *                helpful (upvotes), createdAt, updatedAt
 *
 * Statics:
 *  - calcAverageRating(productId) → updates Product.rating + Product.numReviews
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Review title cannot exceed 100 characters'],
    },

    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },

    // How many users found this review helpful
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Users who marked this review as helpful (prevent duplicate votes)
    helpfulVoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Admin can hide inappropriate reviews
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique index: one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, rating: -1 });

// ── Static: Recalculate Average Rating ───────────────────────────────────────
/**
 * Uses MongoDB aggregation to recalculate the average rating and review
 * count for a product, then persists it to the Product document.
 *
 * Called from post-save and post-remove hooks.
 *
 * @param {ObjectId} productId
 */
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isVisible: true } },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        avgRating:  { $avg: '$rating' },
      },
    },
  ]);

  // Require Product here (not at top) to avoid circular dependency
  const Product = require('./Product');

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating:     Math.round(stats[0].avgRating * 10) / 10, // 1 decimal place
      numReviews: stats[0].numReviews,
    });
  } else {
    // No reviews left — reset to defaults
    await Product.findByIdAndUpdate(productId, {
      rating:     0,
      numReviews: 0,
    });
  }
};

// ── Hooks: Trigger rating recalculation ──────────────────────────────────────
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

// Use pre-hook to capture document before deletion, then recalculate
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Attach the found document to `this` so the post hook can use it
  this._reviewDoc = await this.model.findOne(this.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this._reviewDoc) {
    await this._reviewDoc.constructor.calcAverageRating(this._reviewDoc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
