/**
 * ShopEase - Centralized Error Handling
 *
 * Exports:
 *  - AppError   : Custom error class with statusCode + isOperational flag
 *  - catchAsync : Wraps async route handlers, forwarding errors to next()
 *  - errorHandler : Global Express error-handling middleware
 */

// ── AppError ─────────────────────────────────────────────────────────────────

/**
 * Custom operational error class.
 * Distinguishes between programmer errors (bugs) and operational errors
 * (bad input, DB failures, etc.) so we can handle them differently.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // mark as an expected/handled error

    // Capture stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── catchAsync ───────────────────────────────────────────────────────────────

/**
 * Wraps an async Express route handler so errors are automatically
 * forwarded to the centralized error handler via next().
 *
 * Usage: router.get('/path', catchAsync(async (req, res, next) => { … }))
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── Error Handlers (helpers) ──────────────────────────────────────────────────

/** Handle Mongoose CastError (invalid ObjectId) */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/** Handle Mongoose duplicate key error (code 11000) */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: "${value}" for field "${field}". Please use a different value.`;
  return new AppError(message, 400);
};

/** Handle Mongoose validation errors */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/** Handle invalid JWT */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

/** Handle expired JWT */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

// ── Response Senders ──────────────────────────────────────────────────────────

/** Send full error detail in development */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

/** Send safe, minimal error info in production */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Operational errors: safe to expose to client
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming/unknown errors: don't leak details
    console.error('💥 UNEXPECTED ERROR:', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

// ── Global Error Handler Middleware ───────────────────────────────────────────

/**
 * Express error-handling middleware (4-argument signature required).
 * Mount LAST in app.js after all routes.
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // Clone the error so we don't mutate the original
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;

    // Transform known Mongoose/JWT errors into AppErrors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = { AppError, catchAsync, errorHandler };
