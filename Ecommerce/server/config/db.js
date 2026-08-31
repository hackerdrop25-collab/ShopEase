/**
 * AgriFresh - Database Configuration
 * Connects to MongoDB with priority:
 *  1. Local MongoDB (127.0.0.1)
 *  2. MongoDB Atlas (if local fails and Atlas IP is whitelisted)
 */

const mongoose = require('mongoose');

let retryCount = 0;
const MAX_RETRIES = 5;
let isConnecting = false;

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  // Try local MongoDB FIRST, then Atlas as fallback
  const urisToTry = [
    'mongodb://127.0.0.1:27017/agrifresh',
    'mongodb://localhost:27017/agrifresh',
    process.env.MONGODB_URI,
  ].filter(Boolean);

  for (const uri of urisToTry) {
    const label = uri.includes('mongodb.net') ? 'Atlas' : 'Local MongoDB';
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host} (${label})`);
      retryCount = 0;
      isConnecting = false;
      return;
    } catch (error) {
      console.warn(`⚠️  ${label} connection failed: ${error.message.split('\n')[0]}`);
    }
  }

  retryCount++;
  isConnecting = false;

  if (retryCount < MAX_RETRIES) {
    const delay = Math.min(retryCount * 3000, 15000);
    console.log(`🔄 Retrying DB connection in ${delay / 1000}s... (${retryCount}/${MAX_RETRIES})`);
    setTimeout(connectDB, delay);
  } else {
    console.log('\n⚠️  Could not connect to MongoDB after multiple attempts.');
    console.log('   Options:');
    console.log('   1. Install & start MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('   2. Whitelist your IP (0.0.0.0/0) in MongoDB Atlas: https://cloud.mongodb.com/\n');
  }
};

// ── Mongoose Event Listeners ─────────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  if (retryCount < MAX_RETRIES) {
    console.warn('⚠️  MongoDB disconnected. Reconnecting...');
  }
});

mongoose.connection.on('error', (err) => {
  if (retryCount < MAX_RETRIES) {
    console.error(`🔴 Mongoose error: ${err.message.substring(0, 100)}`);
  }
});

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Closing MongoDB connection…`);
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed. Goodbye!');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
