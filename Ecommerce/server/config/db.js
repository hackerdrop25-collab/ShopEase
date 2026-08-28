/**
 * ShopEase - Database Configuration
 * Connects to MongoDB Atlas using Mongoose with retry logic and event listeners.
 */

const mongoose = require('mongoose');

// Track connection retry count
let retryCount = 0;
const MAX_RETRIES = 3;
let isConnecting = false;

/**
 * Connects to MongoDB with automatic retry on failure.
 * Uses exponential back-off between retries.
 */
const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
      bufferTimeoutMS: 3000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0;
    isConnecting = false;
  } catch (error) {
    retryCount++;
    isConnecting = false;
    
    if (retryCount === 1) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.log(`\n⚠️  Note: To fix MongoDB connection:`);
      console.log(`   1. Go to https://cloud.mongodb.com/`);
      console.log(`   2. Click "Network Access" → "Add IP Address"`);
      console.log(`   3. Click "Allow Access from Anywhere" (0.0.0.0/0)`);
      console.log(`   4. Wait 1-2 minutes and restart the server\n`);
    }

    if (retryCount < MAX_RETRIES) {
      const delay = 3000;
      console.log(`🔄 Retrying connection in ${delay / 1000}s... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(connectDB, delay);
    } else {
      console.log('\n⚠️  Running in OFFLINE MODE - Database features disabled');
      console.log('   API server will work but database operations will fail');
      console.log('   Fix MongoDB connection to enable full functionality\n');
    }
  }
};

// ── Mongoose Event Listeners ─────────────────────────────────────────────────

mongoose.connection.on('disconnected', () => {
  if (retryCount < MAX_RETRIES) {
    console.warn('⚠️  MongoDB disconnected.');
  }
});

mongoose.connection.on('error', (err) => {
  if (retryCount < MAX_RETRIES) {
    console.error(`🔴 Mongoose error: ${err.message.substring(0, 100)}`);
  }
});

// Graceful shutdown — close the DB connection when the process terminates
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Closing MongoDB connection…`);
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed. Goodbye!');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
