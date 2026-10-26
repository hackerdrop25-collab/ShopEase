const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const productsSeed = require('./seed/products.seed');

async function updateAtlas() {
  const atlasUri = process.env.MONGODB_URI;
  if (!atlasUri) return;
  try {
    console.log('Connecting to Atlas...');
    const conn = await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to Atlas.');
    const Product = conn.model('ProductAtlas', new mongoose.Schema({}, { strict: false, collection: 'products' }));

    for (const item of productsSeed) {
      await Product.updateMany(
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
    }
    await Product.updateMany(
      { name: /Titan Mechanical/i },
      {
        $set: {
          images: [{ public_id: 'titan_mech_watch', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500' }],
          imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'
        }
      }
    );
    console.log('Atlas updated.');
    await mongoose.disconnect();
  } catch (err) {
    console.log('Atlas update skipped/error:', err.message);
  }
}
updateAtlas();
