/**
 * ShopEase - JWT Token Utility
 *
 * Centralises JWT creation and cookie-setting so every auth controller
 * sends tokens exactly the same way.
 */

const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for the given user ID.
 *
 * @param {string|ObjectId} userId - MongoDB user _id
 * @returns {string} Signed JWT
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

/**
 * Creates a signed JWT, sets it as an httpOnly cookie on the response,
 * and returns the token string.
 *
 * @param {Object}   user - Mongoose User document
 * @param {number}   statusCode - HTTP status code for the response
 * @param {Object}   res  - Express response object
 * @param {string}   message - Success message
 * @param {Object}   [extraData={}] - Additional fields to merge into the response body
 */
const createSendToken = (user, statusCode, res, message, extraData = {}) => {
  const token = signToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE || 7, 10) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents XSS access from JavaScript
    sameSite: 'strict',
  };

  // In production, only send cookie over HTTPS
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('token', token, cookieOptions);

  // Remove password from the output
  const userOutput = user.toObject ? user.toObject() : { ...user };
  delete userOutput.password;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userOutput,
    ...extraData,
  });
};

module.exports = { signToken, createSendToken };
