const https = require('https');

const candidates = [
  // Football
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
  // Dumbbells
  'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
  // Resistance Bands / Fitness
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',
  'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600',
  'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600',
  // Cricket
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600',
  'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600',
  'https://images.unsplash.com/photo-1593766788306-28561086694e?w=600',
  'https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=600',
  // Badminton
  'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600',
  'https://images.unsplash.com/photo-1521537634581-0dced2fedc42?w=600',
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600',
  // Harry Potter / Magic fantasy books
  'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=600',
  'https://images.unsplash.com/photo-1609866138210-84bb689f3c61?w=600',
  'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
  // Money / Finance book
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600',
  // Kindle / E-reader
  'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=600',
  'https://images.unsplash.com/photo-1507842229451-7f01be837a27?w=600',
  'https://images.unsplash.com/photo-1568667256549-094345857637?w=600',
  // Men's Belt
  'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600',
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600',
  'https://images.unsplash.com/photo-1585856338871-77114660eb61?w=600',
  // Kettle
  'https://images.unsplash.com/photo-1594213114663-ddbe3f298121?w=600',
  'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=600',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600',
  // Pressure Cooker / Pot
  'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
  // Lunch Box
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600',
  // Vacuum Cleaner
  'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600',
  'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600',
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600',
  // Duffle bag
  'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=600',
  'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600',
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600',
  // Analog Watch
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
  // Mechanical Green Dial Watch
  'https://images.unsplash.com/photo-1547996160-71dfabb1a9b1?w=600'
];

function check(url) {
  return new Promise(resolve => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 }, res => {
      resolve({ url, status: res.statusCode, contentType: res.headers['content-type'] });
      res.resume();
    });
    req.on('error', e => resolve({ url, status: 'ERR', error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
  });
}

async function run() {
  for (const c of candidates) {
    const res = await check(c);
    console.log(`${res.status === 200 ? '✅ 200' : '❌ ' + res.status} | ${res.url}`);
  }
}
run();
