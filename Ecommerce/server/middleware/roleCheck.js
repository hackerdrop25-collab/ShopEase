/**
 * ShopEase - Role-Based Access Control Middleware
 *
 * Usage:
 *   router.delete('/product/:id', protect, authorizeRoles('admin'), deleteProduct);
 *   router.get('/admin/users', protect, authorizeRoles('admin'), getUsers);
 *
 * Multiple roles can be passed:
 *   authorizeRoles('admin', 'manager')
 */

const { AppError } = require('./errorHandler');

/**
 * authorizeRoles - Factory that returns middleware restricting
 * access to users whose role is in the allowed list.
 *
 * @param {...string} roles - Allowed role strings (e.g., 'admin', 'user')
 * @returns {Function} Express middleware
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user is populated by the protect middleware (must run first)
    if (!req.user) {
      return next(
        new AppError('Authentication required. Please log in.', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role "${req.user.role}" is not authorized to perform this action.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };
