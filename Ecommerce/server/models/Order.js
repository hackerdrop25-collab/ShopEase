/**
 * ShopEase - Order Model
 *
 * Schema fields:
 *  _id, orderNumber, user, items[], shippingAddress, paymentInfo,
 *  itemsPrice, taxPrice, shippingPrice, totalPrice,
 *  orderStatus, paymentStatus, deliveredAt, cancelledAt,
 *  cancellationReason, trackingNumber, invoiceUrl,
 *  createdAt, updatedAt
 *
 * Order lifecycle:
 *  pending → confirmed → processing → shipped → delivered
 *                                              ↘ cancelled (any stage before delivered)
 *
 * Static:
 *  - generateOrderNumber() → unique human-readable order ID (e.g. "ORD-20240819-XXXXX")
 */

const mongoose = require('mongoose');

// ── Order Item Sub-Schema ─────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      // Supports the current sample catalog IDs and MongoDB Product IDs.
      type: String,
      ref: 'Product',
      required: [true, 'Order item must reference a product'],
    },

    // Snapshot data (preserved even if product is later deleted/updated)
    title:    { type: String, required: true },
    image:    { type: String, default: '' },
    price:    { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },

    // Subtotal for this line item
    itemTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ── Shipping Address Sub-Schema ───────────────────────────────────────────────
const shippingAddressSchema = new mongoose.Schema(
  {
    name:    { type: String, required: [true, 'Recipient name is required'], trim: true },
    phone:   { type: String, required: [true, 'Phone is required'], trim: true },
    street:  { type: String, required: [true, 'Street is required'], trim: true },
    city:    { type: String, required: [true, 'City is required'], trim: true },
    state:   { type: String, required: [true, 'State is required'], trim: true },
    pincode: { type: String, required: [true, 'Pincode is required'], trim: true },
    country: { type: String, default: 'India', trim: true },
  },
  { _id: false }
);

// ── Payment Info Sub-Schema ───────────────────────────────────────────────────
const paymentInfoSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['razorpay', 'cod'],
        message: 'Payment method must be "razorpay" or "cod"',
      },
    },

    // Razorpay-specific fields
    razorpayOrderId:   { type: String, select: false }, // Razorpay order ID
    razorpayPaymentId: { type: String },                // Razorpay payment ID (after success)
    razorpaySignature: { type: String, select: false }, // for verification

    paidAt: { type: Date },
  },
  { _id: false }
);

// ── Order Schema ──────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Human-readable order number (e.g. "ORD-20240819-A3F2E")
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
      index: true,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'Order must contain at least one item',
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },

    paymentInfo: {
      type: paymentInfoSchema,
      required: [true, 'Payment info is required'],
    },

    // Price breakdown
    itemsPrice:    { type: Number, required: true, min: 0 }, // sum of all item totals
    taxPrice:      { type: Number, default: 0,    min: 0 }, // GST (18%)
    shippingPrice: { type: Number, default: 0,    min: 0 }, // free above ₹500
    discount:      { type: Number, default: 0,    min: 0 }, // coupon discount
    totalPrice:    { type: Number, required: true, min: 0 }, // final amount charged

    orderStatus: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'pending',
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },

    // Status timestamps
    confirmedAt:  { type: Date },
    processingAt: { type: Date },
    shippedAt:    { type: Date },
    deliveredAt:  { type: Date },

    // Cancellation
    cancelledAt:        { type: Date },
    cancellationReason: { type: String, trim: true, maxlength: 500 },

    // Logistics
    trackingNumber:  { type: String, trim: true },
    trackingUrl:     { type: String, trim: true },

    // Cloudinary URL of generated invoice PDF
    invoiceUrl: { type: String },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.razorpayOrderId': 1 });

// ── Static: Generate Order Number ────────────────────────────────────────────
/**
 * Generates a unique, human-readable order number.
 * Format: ORD-YYYYMMDD-XXXXX  (XXXXX = 5 random uppercase alphanumeric chars)
 *
 * @returns {string}
 */
orderSchema.statics.generateOrderNumber = function () {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, ''); // "20240819"
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase(); // "A3F2E"
  return `ORD-${datePart}-${randomPart}`;
};

// ── Pre-save Hook: Auto-generate order number ─────────────────────────────────
orderSchema.pre('save', function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = this.constructor.generateOrderNumber();
  }
  next();
});

// ── Instance Method: Update order status with timestamp ───────────────────────
/**
 * Transitions order to a new status and records the timestamp.
 *
 * @param {string} newStatus - Target status
 * @param {string} [reason]  - Required when cancelling
 */
orderSchema.methods.updateStatus = async function (newStatus, reason = '') {
  const validTransitions = {
    pending:    ['confirmed', 'cancelled'],
    confirmed:  ['processing', 'cancelled'],
    processing: ['shipped',   'cancelled'],
    shipped:    ['delivered', 'cancelled'],
    delivered:  [],
    cancelled:  [],
  };

  if (!validTransitions[this.orderStatus].includes(newStatus)) {
    const { AppError } = require('../middleware/errorHandler');
    throw new AppError(
      `Cannot transition order from "${this.orderStatus}" to "${newStatus}"`,
      400
    );
  }

  this.orderStatus = newStatus;

  const now = new Date();
  switch (newStatus) {
    case 'confirmed':  this.confirmedAt  = now; break;
    case 'processing': this.processingAt = now; break;
    case 'shipped':    this.shippedAt    = now; break;
    case 'delivered':
      this.deliveredAt = now;
      if (this.paymentInfo.method === 'cod') {
        this.paymentStatus = 'paid';
        this.paymentInfo.paidAt = now;
      }
      break;
    case 'cancelled':
      this.cancelledAt = now;
      this.cancellationReason = reason;
      break;
    default: break;
  }

  return this.save();
};

// ── Virtual: Is Cancellable ───────────────────────────────────────────────────
orderSchema.virtual('isCancellable').get(function () {
  return ['pending', 'confirmed', 'processing'].includes(this.orderStatus);
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
