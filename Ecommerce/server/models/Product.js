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
    name: {
      type: String,
      trim: true,
    },

    title: {
      type: String,
      trim: true,
    },

    // URL-friendly identifier (auto-generated from title/name)
    slug: {
      type: String,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
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
    },

    stock: {
      type: Number,
      default: 0,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    subcategory: {
      type: String,
      trim: true,
      default: 'General',
    },

    unit: {
      type: String,
      trim: true,
      default: '1 kg',
    },

    isOrganic: {
      type: Boolean,
      default: true,
    },

    farmOrigin: {
      type: String,
      trim: true,
      default: 'Organic Valley Farms',
    },

    harvestDate: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    images: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
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

// ── Pre-validate Hook: Sync name and title ──────────────────────────────────
productSchema.pre('validate', function (next) {
  if (this.name && !this.title) this.title = this.name;
  if (this.title && !this.name) this.name = this.title;
  next();
});

// ── Pre-save Hook: Generate Slug ──────────────────────────────────────────────
productSchema.pre('save', async function (next) {
  const titleOrName = this.title || this.name;
  if (!titleOrName) return next();

  if (!this.isModified('title') && !this.isModified('name') && this.slug) return next();

  // Convert title/name to lowercase kebab-case slug
  let slug = titleOrName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special characters
    .trim()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-');           // collapse multiple hyphens

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
