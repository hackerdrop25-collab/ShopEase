const mongoose = require('mongoose');
const fs = require('fs');

async function dump() {
  await mongoose.connect('mongodb://127.0.0.1:27017/agrifresh');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const prods = await Product.find({}, { name: 1, category: 1, description: 1, images: 1, imageUrl: 1, price: 1 });
  fs.writeFileSync('all_products.json', JSON.stringify(prods, null, 2));
  console.log('Saved', prods.length, 'products to all_products.json');
  await mongoose.disconnect();
}
dump();
