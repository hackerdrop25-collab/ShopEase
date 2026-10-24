const mongoose = require('mongoose');
const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve({ error: 'invalid_url' });
    try {
      const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 }, (res) => {
        resolve({ statusCode: res.statusCode });
      });
      req.on('error', (e) => resolve({ error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
    } catch (err) {
      resolve({ error: err.message });
    }
  });
}

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/agrifresh');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const prods = await Product.find({}, { name: 1, images: 1, imageUrl: 1, category: 1, description: 1 });
  console.log(`Total products: ${prods.length}`);

  const results = [];
  for (const p of prods) {
    const img = p.images?.[0]?.url || p.imageUrl || (typeof p.images?.[0] === 'string' ? p.images[0] : null);
    const res = await checkUrl(img);
    results.push({
      id: p._id,
      name: p.name,
      category: p.category,
      status: res.statusCode || res.error,
      img
    });
  }

  for (const r of results) {
    console.log(`[${r.status}] [${r.category}] "${r.name}" -> ${r.img}`);
  }

  await mongoose.disconnect();
}
run();
