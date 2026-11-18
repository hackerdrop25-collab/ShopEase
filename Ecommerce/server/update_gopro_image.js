const mongoose = require('mongoose');

const NEW_GOPRO_URL = 'https://images.unsplash.com/photo-1462465024002-a13e2d586449?w=500';

async function updateAllLocalDbs() {
  const dbs = ['agrifresh', 'shopease'];
  for (const db of dbs) {
    try {
      const uri = `mongodb://127.0.0.1:27017/${db}`;
      const conn = await mongoose.createConnection(uri).asPromise();
      console.log(`Connected to ${uri}`);
      const Product = conn.model('Product', new mongoose.Schema({}, { strict: false }));
      
      const res = await Product.updateMany(
        { $or: [{ name: /GoPro/i }, { 'images.url': /photo-1606041008023/ }] },
        {
          $set: {
            images: [{ public_id: 'gopro', url: NEW_GOPRO_URL }],
            imageUrl: NEW_GOPRO_URL
          }
        }
      );
      console.log(`Updated ${res.modifiedCount} product(s) in ${db}`);
      
      const gopro = await Product.findOne({ name: /GoPro/i });
      if (gopro) {
        console.log(`Verified GoPro in ${db}:`, gopro.name, '->', gopro.images?.[0]?.url || gopro.imageUrl);
      }
      await conn.close();
    } catch (err) {
      console.log(`Error updating ${db}:`, err.message);
    }
  }
}

updateAllLocalDbs();
