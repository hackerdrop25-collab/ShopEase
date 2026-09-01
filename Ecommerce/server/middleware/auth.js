/**
 * ShopEase - JWT Authentication Middleware
 *
 * Protects routes by verifying the JWT from either:
 *   1. The Authorization header: "Bearer <token>"
 *   2. The httpOnly cookie: "token"
 *
 * Attaches the decoded user payload to req.user.
 * Full user population (from DB) happens here so downstream
 * controllers always have fresh user data.
 */

const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('./errorHandler');

// NOTE: The User model is required lazily (inside the function) to avoid
// circular dependency issues during Phase 1. Phase 3 will complete this.
let User;
const getUserModel = () => {
  if (!User) {
    // Dynamically require to prevent circular deps at startup
    User = require('../models/User');
  }
  return User;
};

/**
 * protect - Verifies JWT and attaches req.user.
 * Use on any route that requires the user to be logged in.
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback: extract from httpOnly cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  // 3. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Let the global error handler transform JsonWebTokenError / TokenExpiredError
    return next(err);
  }

  // 4. Check if user still exists (e.g., deleted after token was issued)
  const UserModel = getUserModel();
  const currentUser = await UserModel.findById(decoded.id).select('-password');

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exists.',
        401
      )
    );
  }

  // 5. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'You recently changed your password. Please log in again.',
        401
      )
    );
  }

  // 6. Attach user to request
  req.user = currentUser;
  next();
});

module.exports = { protect };


/**
 * authorize - Restricts access to specific roles (admin, user, etc.)
 * Use after protect middleware to check user role.
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('You must be logged in to access this resource.', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
