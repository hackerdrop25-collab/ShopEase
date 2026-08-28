/**
 * ShopEase - Validate Request Middleware
 *
 * Works with express-validator.
 * Place this AFTER the validation rule arrays in your routes.
 *
 * Usage:
 *   router.post('/register', [...validationRules], validate, registerUser);
 */

const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * validate - Collects express-validator errors and returns a 422 response
 * if any validation rules were violated.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into a clean array for the client
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(422).json({
      success: false,
      status: 'fail',
      message: 'Validation failed. Please check your input.',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = { validate };
