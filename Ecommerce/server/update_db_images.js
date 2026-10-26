const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const productsSeed = require('./seed/products.seed');

async function updateDatabaseImages() {
  const uris = [
    'mongodb://127.0.0.1:27017/agrifresh',
    'mongodb://localhost:27017/agrifresh',
    'mongodb://127.0.0.1:27017/shopease',
    process.env.MONGODB_URI
  ].filter(Boolean);

  for (const uri of uris) {
    try {
      console.log(`Connecting to: ${uri}...`);
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`✅ Connected to ${uri}`);

      const Product = conn.model('Product', new mongoose.Schema({}, { strict: false }));
      
      let updatedCount = 0;
      for (const item of productsSeed) {
        const updateResult = await Product.updateMany(
          { name: item.name },
          {
            $set: {
              images: item.images,
              imageUrl: item.images?.[0]?.url,
              description: item.description,
              category: item.category
            }
          }
        );
        if (updateResult.modifiedCount > 0) {
          updatedCount += updateResult.modifiedCount;
          console.log(`Updated "${item.name}" -> ${item.images?.[0]?.url}`);
        }
      }

      // Also update Titan watch if present
      const titanResult = await Product.updateMany(
        { name: /Titan Mechanical/i },
        {
          $set: {
            images: [{ public_id: 'titan_mech_watch', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500' }],
            imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'
          }
        }
      );
      if (titanResult.modifiedCount > 0) {
        console.log(`Updated Titan Mechanical Green Dial Watch`);
        updatedCount += titanResult.modifiedCount;
      }

      console.log(`\n🎉 Total products updated in ${uri}: ${updatedCount}`);
      await mongoose.disconnect();
    } catch (err) {
      console.warn(`Connection/update to ${uri} failed: ${err.message}`);
    }
  }

  console.log('\n✅ All database image updates finished!');
  process.exit(0);
}

updateDatabaseImages();
