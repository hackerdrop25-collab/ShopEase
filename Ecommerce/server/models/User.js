/**
 * ShopEase - User Model
 *
 * Schema fields: _id, name, email, password, phone, address,
 *                role, avatar, isVerified, verificationToken,
 *                resetPasswordToken, resetPasswordExpire,
 *                passwordChangedAt, createdAt, updatedAt
 *
 * Instance methods:
 *  - comparePassword(candidatePassword)  → Boolean
 *  - changedPasswordAfter(jwtIat)        → Boolean
 *  - createPasswordResetToken()          → rawToken (string)
 *  - createEmailVerificationToken()      → rawToken (string)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ── Address Sub-Schema ────────────────────────────────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    street:  { type: String, trim: true },
    city:    { type: String, trim: true },
    state:   { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    phone:   { type: String, trim: true },
  },
  { _id: false } // embedded, no separate _id needed
);

// ── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },

    avatar: {
      public_id: { type: String, default: '' },
      url: {
        type: String,
        default: 'https://res.cloudinary.com/shopease/image/upload/v1/avatars/default_avatar.png',
      },
    },

    role: {
      type: String,
      enum: { values: ['user', 'admin'], message: 'Role must be either "user" or "admin"' },
      default: 'user',
    },

    // Shipping addresses (up to 5)
    addresses: {
      type: [addressSchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'You can save a maximum of 5 addresses',
      },
    },

    // Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken:        { type: String, select: false },
    verificationTokenExpire:  { type: Date,   select: false },

    // Password reset
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpire:  { type: Date,   select: false },

    // Tracks when password was last changed (used by JWT middleware)
    passwordChangedAt: { type: Date, select: false },

    // Soft-delete / account deactivation
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true, // auto-adds createdAt + updatedAt
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Note: email unique index is defined via `unique: true` on the field above

// ── Pre-save Hook: Hash password before saving ────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  // Hash with cost factor 12 (good balance of security and speed)
  this.password = await bcrypt.hash(this.password, 12);

  // Update passwordChangedAt (not for new accounts)
  if (!this.isNew) {
    // Subtract 1s to account for token-issue latency
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

// ── Pre-find Hook: Exclude deactivated accounts ───────────────────────────────
userSchema.pre(/^find/, function (next) {
  // `this` is the current query
  this.find({ isActive: { $ne: false } });
  next();
});

// ── Instance Methods ──────────────────────────────────────────────────────────

/**
 * Compare a plain-text candidate password with the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if the password was changed AFTER the JWT was issued.
 * Prevents use of old tokens after a password change.
 *
 * @param {number} jwtTimestamp - The `iat` field from the decoded JWT (in seconds)
 * @returns {boolean} true if password changed after token issue
 */
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Generate a raw (plain) password reset token, store its SHA-256 hash
 * in the DB, and set a 10-minute expiry.
 *
 * @returns {string} The raw token to send to the user via email
 */
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Store only the hash — if DB is compromised, tokens are useless
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return rawToken;
};

/**
 * Generate a raw email verification token, store its hash, set 24h expiry.
 *
 * @returns {string} The raw token to embed in the verification link
 */
userSchema.methods.createEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return rawToken;
};

// ── Virtual: Full avatar URL ──────────────────────────────────────────────────
userSchema.virtual('avatarUrl').get(function () {
  return this.avatar?.url || '';
});

const User = mongoose.model('User', userSchema);

module.exports = User;
