const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const seedCatalogData = require('./config/seedCatalogData');

async function seed() {
  const urisToTry = [
    'mongodb://127.0.0.1:27017/shopease',
    'mongodb://localhost:27017/shopease',
    process.env.MONGODB_URI,
  ].filter(Boolean);

  let connected = false;
  for (const uri of urisToTry) {
    try {
      console.log(`Connecting to ${uri.includes('mongodb.net') ? 'Atlas' : 'Local MongoDB'}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`✅ Connected to MongoDB via: ${uri.includes('mongodb.net') ? 'Atlas' : 'Local'}`);
      connected = true;
      break;
    } catch (err) {
      console.warn(`Connection attempt to ${uri.includes('mongodb.net') ? 'Atlas' : 'Local'} failed: ${err.message}`);
    }
  }

  if (!connected) {
    console.error('❌ Could not connect to any MongoDB instance. Make sure MongoDB is running locally or Atlas IP is whitelisted.');
    process.exit(1);
  }

  try {
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const created = await Product.insertMany(seedCatalogData);
    console.log(`🎉 Successfully seeded ${created.length} AgriFresh agricultural products into MongoDB!`);

    const categories = await Product.distinct('category');
    console.log('Categories present:', categories);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
