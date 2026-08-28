/**
 * ShopEase - Product Model
 *
 * Schema fields: _id, title, slug, description, shortDescription,
 *                price, comparePrice, stock, category, brand, images,
 *                rating, numReviews, specifications, tags, isFeatured,
 *                isActive, createdAt, updatedAt
 *
 * Virtuals:
 *  - reviews  (populated from Review collection)
 *  - discount (computed percentage off comparePrice)
 *
 * Pre-save hook:
 *  - Auto-generates URL-friendly slug from title
 */

const mongoose = require('mongoose');

// ── Image Sub-Schema ──────────────────────────────────────────────────────────
const imageSchema = new mongoose.Schema(
  {
    public_id: { type: String, required: true },
    url:       { type: String, required: true },
    altText:   { type: String, default: '' },
  },
  { _id: false }
);

// ── Specification Sub-Schema (key-value pairs) ────────────────────────────────
const specSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// ── Product Schema ────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [3,   'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    // URL-friendly identifier (auto-generated from title)
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [20,   'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },

    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Original / MRP price (for showing discount)
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
      validate: {
        validator: function (val) {
          // comparePrice must be >= price if provided
          return !val || val >= this.price;
        },
        message: 'Compare price must be greater than or equal to selling price',
      },
    },

    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: [
          'Electronics',
          'Fashion',
          'Home & Kitchen',
          'Books',
          'Sports & Outdoors',
          'Beauty & Personal Care',
          'Toys & Games',
          'Automotive',
          'Health & Wellness',
          'Grocery',
          'Other',
        ],
        message: '{VALUE} is not a supported category',
      },
    },

    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },

    // At least one product image is required
    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'At least one product image is required',
      },
    },

    // Average rating — auto-updated by Review.calcAverageRating()
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },

    // Review count — auto-updated by Review.calcAverageRating()
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Key-value specifications (e.g. { key: 'RAM', value: '8GB' })
    specifications: [specSchema],

    // Searchable tags (e.g. ['laptop', 'gaming', 'dell'])
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Reference to the admin who created this product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
productSchema.index({ title: 'text', description: 'text', tags: 'text' }); // full-text search
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1, numReviews: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ slug: 1 });

// ── Virtual: Reviews (populated on demand) ────────────────────────────────────
productSchema.virtual('reviews', {
  ref:          'Review',
  foreignField: 'product',
  localField:   '_id',
});

// ── Virtual: Discount Percentage ─────────────────────────────────────────────
productSchema.virtual('discountPercent').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// ── Virtual: In Stock ─────────────────────────────────────────────────────────
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// ── Pre-save Hook: Generate Slug ──────────────────────────────────────────────
productSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  // Convert title to lowercase kebab-case slug
  let slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special characters
    .trim()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-');           // collapse multiple hyphens

  // Ensure uniqueness by appending a short ID suffix if needed
  const existing = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
  if (existing) {
    slug = `${slug}-${this._id.toString().slice(-6)}`;
  }

  this.slug = slug;
  next();
});

// ── Query Middleware: Exclude inactive products ───────────────────────────────
productSchema.pre(/^find/, function (next) {
  // Only apply to external queries (not internal admin queries)
  if (!this._skipActiveFilter) {
    this.find({ isActive: { $ne: false } });
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
