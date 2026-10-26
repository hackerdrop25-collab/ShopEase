const https = require('https');
const products = require('./seed/products.seed');

function testUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve({ status: 'NO_URL' });
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, (res) => {
      resolve({
        status: res.statusCode,
        contentType: res.headers['content-type'],
        isImage: res.headers['content-type']?.startsWith('image/')
      });
      res.resume();
    });
    req.on('error', (e) => resolve({ status: 'ERROR', error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
  });
}

async function checkSeedUrls() {
  const bad = [];
  const ok = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const url = p.images?.[0]?.url;
    const res = await testUrl(url);
    if (res.status === 200 && res.isImage) {
      ok.push({ index: i, name: p.name, category: p.category, url });
    } else {
      bad.push({ index: i, name: p.name, category: p.category, url, error: res.status, contentType: res.contentType });
    }
  }

  console.log(`\n--- RESULTS ---`);
  console.log(`Total: ${products.length} | OK: ${ok.length} | Broken: ${bad.length}`);
  if (bad.length > 0) {
    console.log('\n--- BROKEN IMAGES (404 / Non-image) ---');
    bad.forEach(b => {
      console.log(`[${b.category}] "${b.name}" -> ${b.error} (${b.contentType}) | ${b.url}`);
    });
  }
}

checkSeedUrls();
