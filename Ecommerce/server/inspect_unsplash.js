const https = require('https');
const products = require('./seed/products.seed');

function getUnsplashInfo(photoId) {
  return new Promise((resolve) => {
    const url = `https://unsplash.com/photos/${photoId}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => { if (data.length < 50000) data += chunk; });
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        const descMatch = data.match(/<meta name="description" content="([^"]+)"/i);
        resolve({
          statusCode: res.statusCode,
          title: titleMatch ? titleMatch[1] : '',
          description: descMatch ? descMatch[1] : ''
        });
      });
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function checkAll() {
  console.log(`Checking ${products.length} products in seed...`);
  for (const p of products) {
    const imgUrl = p.images?.[0]?.url || '';
    const match = imgUrl.match(/photo-([a-zA-Z0-9_-]+)/);
    const photoId = match ? `photo-${match[1]}` : null;
    let info = { title: 'No ID' };
    if (photoId) {
      info = await getUnsplashInfo(photoId);
    }
    console.log(`[${p.category}] "${p.name}"`);
    console.log(`   URL: ${imgUrl}`);
    console.log(`   Unsplash: status=${info.statusCode} | ${info.title?.substring(0, 80)}`);
  }
}
checkAll();
