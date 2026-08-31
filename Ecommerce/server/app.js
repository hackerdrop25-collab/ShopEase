/**
 * ShopEase - Express Application
 *
 * Sets up the Express app with:
 *  - Security middleware (Helmet, CORS, rate-limiting, mongo-sanitize, xss-clean)
 *  - Request parsing (JSON, URL-encoded, cookies)
 *  - HTTP request logging (Morgan)
 *  - API route mounting under /api
 *  - 404 handler
 *  - Global error handler
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');

// xss-clean removed (deprecated) — Helmet CSP + mongoSanitize handle injection prevention
const routes = require('./routes/index');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler, AppError } = require('./middleware/errorHandler');

const app = express();

// ── 1. Security Headers (Helmet) ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images from Cloudinary
  })
);

// ── 2. CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin "${origin}" is not allowed.`));
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── 3. Global Rate Limiter ───────────────────────────────────────────────────
// Limits each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// Stricter limiter for auth routes (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/register attempts. Please try again after 15 minutes.',
  },
});
app.use('/api/auth', authLimiter);

// ── 4. HTTP Request Logger ───────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── 5. Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));           // parse JSON bodies (max 10kb)
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parse URL-encoded bodies
app.use(cookieParser());                             // parse Cookie header

app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Start MongoDB locally or whitelist your IP in MongoDB Atlas (https://cloud.mongodb.com).',
    });
  }
  return next();
});

// ── 6. Data Sanitization ─────────────────────────────────────────────────────
// Prevent NoSQL injection attacks (e.g. { "$gt": "" })
app.use(mongoSanitize());

// ── 7. Root Welcome Route ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🛒 Welcome to ShopEase API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ── 8. API Routes ─────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', routes);

// ── 9. 404 Handler (for unmatched routes) ────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// ── 10. Global Error Handler (must be last) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
