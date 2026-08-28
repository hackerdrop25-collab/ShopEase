/**
 * ShopEase - Server Entry Point
 *
 * Responsibilities:
 *  1. Load environment variables from .env
 *  2. Connect to MongoDB
 *  3. Start the HTTP server
 *  4. Handle unhandled promise rejections and uncaught exceptions
 */

// ── Load environment variables FIRST (before any other imports) ──────────────
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/.env` });

// ── Import app and DB connection ─────────────────────────────────────────────
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Handle Uncaught Exceptions ───────────────────────────────────────────────
// Must be registered BEFORE any other code runs
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down…');
  console.error(`${err.name}: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// ── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ── Start HTTP Server ─────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║        🛒  ShopEase API Server       ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`  ✅ Server running in ${NODE_ENV} mode`);
  console.log(`  🌐 URL:  http://localhost:${PORT}`);
  console.log(`  📡 API:  http://localhost:${PORT}/api/health`);
  console.log('');
});

// ── Handle Unhandled Promise Rejections ──────────────────────────────────────
// Gracefully shut down the server so all pending requests are finished
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully…');
  console.error(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
