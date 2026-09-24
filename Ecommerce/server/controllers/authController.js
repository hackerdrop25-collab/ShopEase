/**
 * ShopEase - Auth Controller
 *
 * Handles all authentication logic:
 *  - register          POST /api/auth/register
 *  - login             POST /api/auth/login
 *  - logout            POST /api/auth/logout
 *  - getProfile        GET  /api/auth/profile
 *  - updateProfile     PUT  /api/auth/profile
 *  - changePassword    PUT  /api/auth/change-password
 *  - forgotPassword    POST /api/auth/forgot-password
 *  - resetPassword     PUT  /api/auth/reset-password/:token
 *  - verifyEmail       GET  /api/auth/verify-email/:token
 *  - resendVerification POST /api/auth/resend-verification
 *  - deleteAccount     DELETE /api/auth/delete-account
 */

const crypto = require('crypto');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { createSendToken }      = require('../utils/jwtToken');
const { sendEmail }            = require('../utils/sendEmail');
const { sendResponse }         = require('../utils/sendResponse');
const User                     = require('../models/User');
const Cart                     = require('../models/Cart');
const Wishlist                 = require('../models/Wishlist');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build frontend URL (used in email links)
// ─────────────────────────────────────────────────────────────────────────────
const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:3000';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Check if email already in use
  const existing = await User.findOne({ email }).select('+isActive');
  if (existing) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  // Create user (password is hashed by the pre-save hook)
  const user = await User.create({ name, email, password, phone });

  // Create empty Cart + Wishlist for the new user
  await Promise.all([
    Cart.create({ user: user._id }),
    Wishlist.create({ user: user._id }),
  ]);

  // Generate email verification token and send
  const rawToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${clientUrl()}/verify-email/${rawToken}`;

  try {
    await sendEmail({
      to:      user.email,
      subject: 'ShopEase — Verify Your Email Address',
      html: `
        <h2>Welcome to ShopEase, ${user.name}! 🛒</h2>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <a href="${verifyUrl}" style="
          display:inline-block;padding:12px 24px;
          background:#6366f1;color:#fff;border-radius:6px;
          text-decoration:none;font-weight:bold;">
          Verify Email
        </a>
        <p>This link expires in <strong>24 hours</strong>.</p>
        <p>If you did not create an account, please ignore this email.</p>
      `,
      text: `Welcome to ShopEase! Verify your email: ${verifyUrl}`,
    });
  } catch {
    // Don't block registration if email fails — user can resend later
    console.warn('⚠️  Verification email could not be sent.');
  }

  // Issue JWT + set httpOnly cookie
  createSendToken(user, 201, res, 'Registration successful! Please verify your email.');
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Fetch user WITH password (normally excluded by `select: false`)
  const user = await User.findOne({ email }).select('+password +isActive');

  if (!user || !(await user.comparePassword(password))) {
    // Use a generic message to prevent email enumeration
    return next(new AppError('Invalid email or password.', 401));
  }

  createSendToken(user, 200, res, 'Logged in successfully.');
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Logout user (clear httpOnly cookie)
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.logout = catchAsync(async (req, res) => {
  res.cookie('token', 'loggedout', {
    expires:  new Date(Date.now() + 5 * 1000), // expire in 5 seconds
    httpOnly: true,
    sameSite: 'strict',
  });

  sendResponse(res, 200, 'Logged out successfully.');
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getProfile = catchAsync(async (req, res) => {
  // req.user is populated by protect middleware
  const user = await User.findById(req.user._id);

  sendResponse(res, 200, 'Profile fetched successfully.', { user });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update profile (name, phone, addresses, avatar)
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = catchAsync(async (req, res, next) => {
  // Disallow password and role changes via this route
  const forbidden = ['password', 'role', 'email'];
  forbidden.forEach((field) => {
    if (req.body[field]) {
      return next(
        new AppError(`Cannot update "${field}" via this route.`, 400)
      );
    }
  });

  const allowedFields = ['name', 'phone', 'addresses'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Handle avatar upload (Cloudinary) — done in Phase 6
  if (req.file) {
    updates.avatar = {
      public_id: req.file.public_id || '',
      url:       req.file.secure_url || req.file.path,
    };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  sendResponse(res, 200, 'Profile updated successfully.', { user });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Change password (requires current password)
// @route   PUT /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Fetch user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  if (currentPassword === newPassword) {
    return next(new AppError('New password must be different from the current password.', 400));
  }

  user.password = newPassword;
  await user.save(); // pre-save hook hashes the new password

  // Re-issue token so the user stays logged in
  createSendToken(user, 200, res, 'Password changed successfully.');
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Forgot password — send 6-digit verification code to email
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide your email address.', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Generic response if not found (prevent enumeration)
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a 6-digit reset code has been sent.',
    });
  }

  // Generate 6-digit OTP code and save hashed version to DB
  const rawCode = user.createPasswordResetCode ? user.createPasswordResetCode() : user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  console.log(`\n🔑 [ShopEase] Password Reset OTP Code for ${user.email}: [ ${rawCode} ]\n`);

  try {
    await sendEmail({
      to:      user.email,
      subject: `ShopEase — Your Password Reset Code: ${rawCode}`,
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;background:#ffffff;">
          <div style="text-align:center;margin-bottom:20px;">
            <h1 style="color:#2874f0;font-size:26px;margin:0;">🛒 ShopEase</h1>
            <p style="color:#666;font-size:14px;margin-top:4px;">Secure Password Reset</p>
          </div>
          <p style="font-size:15px;color:#333;">Hello <strong>${user.name || 'valued customer'}</strong>,</p>
          <p style="font-size:14px;color:#555;line-height:1.5;">You requested a password reset for your ShopEase account. Enter the following 6-digit verification code in the app to set your new password:</p>
          <div style="text-align:center;margin:28px 0;">
            <div style="display:inline-block;padding:14px 32px;background:#f0f4ff;border:2px dashed #2874f0;border-radius:10px;">
              <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#2874f0;font-family:monospace;">${rawCode}</span>
            </div>
          </div>
          <p style="font-size:13px;color:#e65100;font-weight:600;text-align:center;">⏱️ This verification code is valid for 10 minutes.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
          <p style="font-size:12px;color:#999;text-align:center;">If you did not request this password reset, please ignore this email. Your password remains safe.</p>
        </div>
      `,
      text: `Your ShopEase password reset code is: ${rawCode} (expires in 10 minutes).`,
    });
  } catch (err) {
    console.warn(`⚠️ Reset email could not be delivered via SMTP: ${err.message}. OTP code generated: ${rawCode}`);
  }

  return res.status(200).json({
    success: true,
    message: 'A 6-digit verification code has been sent to your email.',
    resetCode: process.env.NODE_ENV === 'development' ? rawCode : undefined,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset password using 6-digit code (or token)
// @route   POST /api/auth/reset-password OR PUT /api/auth/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = catchAsync(async (req, res, next) => {
  const tokenOrCode = (req.params.token || req.body.code || req.body.token || '').toString().trim();
  const email = (req.body.email || '').toLowerCase().trim();
  const password = req.body.password || req.body.newPassword;

  if (!tokenOrCode) {
    return next(new AppError('Please enter the 6-digit verification code.', 400));
  }
  if (!password) {
    return next(new AppError('Please provide your new password.', 400));
  }

  // Hash code / token to compare with stored SHA-256 hash
  const hashedToken = crypto.createHash('sha256').update(tokenOrCode).digest('hex');

  const query = {
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() }, // must not be expired
  };
  if (email) {
    query.email = email;
  }

  const user = await User.findOne(query).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    return next(new AppError('Invalid or expired verification code. Please request a new code.', 400));
  }

  // Set new password + clear reset fields
  user.password            = password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Log the user in immediately with new token
  createSendToken(user, 200, res, 'Password reset successful! You are now logged in.');
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify email address using token from email link
// @route   GET /api/auth/verify-email/:token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    verificationToken:       hashedToken,
    verificationTokenExpire: { $gt: Date.now() },
  }).select('+verificationToken +verificationTokenExpire');

  if (!user) {
    return next(new AppError('Email verification link is invalid or has expired.', 400));
  }

  user.isVerified              = true;
  user.verificationToken       = undefined;
  user.verificationTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, 'Email verified successfully! You can now log in.');
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.resendVerification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('+verificationToken +verificationTokenExpire');

  if (user.isVerified) {
    return next(new AppError('This account is already verified.', 400));
  }

  const rawToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${clientUrl()}/verify-email/${rawToken}`;

  try {
    await sendEmail({
      to:      user.email,
      subject: 'ShopEase — Verify Your Email Address',
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your ShopEase account:</p>
        <a href="${verifyUrl}" style="
          display:inline-block;padding:12px 24px;
          background:#6366f1;color:#fff;border-radius:6px;
          text-decoration:none;font-weight:bold;">
          Verify Email
        </a>
        <p>This link expires in <strong>24 hours</strong>.</p>
      `,
      text: `Verify your ShopEase email: ${verifyUrl}`,
    });

    sendResponse(res, 200, 'Verification email resent. Please check your inbox.');
  } catch {
    return next(new AppError('Failed to send verification email. Please try again.', 500));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Soft-delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(password))) {
    return next(new AppError('Incorrect password. Account deletion cancelled.', 401));
  }

  // Soft delete — set isActive to false (pre-find hook will exclude this user)
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  // Clear cookie
  res.cookie('token', 'loggedout', {
    expires:  new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    sameSite: 'strict',
  });

  sendResponse(res, 200, 'Account deleted successfully. Sorry to see you go!');
});
