/**
 * ShopEase - Auth Routes
 *
 * Base path: /api/auth
 *
 * Public routes  (no JWT required):
 *   POST   /register
 *   POST   /login
 *   POST   /forgot-password
 *   PUT    /reset-password/:token
 *   GET    /verify-email/:token
 *
 * Private routes (JWT required via protect middleware):
 *   POST   /logout
 *   GET    /profile
 *   PUT    /profile
 *   PUT    /change-password
 *   POST   /resend-verification
 *   DELETE /delete-account
 */

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  deleteAccount,
} = require('../controllers/authController');

const { protect }          = require('../middleware/auth');
const { validate }         = require('../middleware/validate');
const { registerRules, loginRules, forgotPasswordRules,
        resetPasswordRules, changePasswordRules, updateProfileRules }
                           = require('../middleware/validators/authValidators');

// ── Public Routes ─────────────────────────────────────────────────────────────

/** Register a new user */
router.post('/register', registerRules, validate, register);

/** Login with email + password */
router.post('/login', loginRules, validate, login);

/** Request password reset email */
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);

/** Reset password using token from email */
router.put('/reset-password/:token', resetPasswordRules, validate, resetPassword);

/** Verify email address using token from email */
router.get('/verify-email/:token', verifyEmail);

// ── Private Routes (require JWT) ─────────────────────────────────────────────

/** Logout (clears httpOnly cookie) */
router.post('/logout', protect, logout);

/** Get current user's profile */
router.get('/profile', protect, getProfile);

/** Update profile (name, phone, addresses) */
router.put('/profile', protect, updateProfileRules, validate, updateProfile);

/** Change password (requires current password) */
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

/** Resend email verification link */
router.post('/resend-verification', protect, resendVerification);

/** Soft-delete account */
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
