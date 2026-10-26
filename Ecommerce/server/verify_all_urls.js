const https = require('https');

const urls = [
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
  'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
  'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
  'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=500',
  'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=500',
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
  'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=500',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500',
  'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500',
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500',
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500',
  'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
  'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
  'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500',
  'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=500',
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
  'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500',
  'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500',
  'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500',
  'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500',
  'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500',
  'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
  'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500',
  'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=500',
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
  'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500',
  'https://images.unsplash.com/photo-1593766788306-28561086694e?w=500',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500',
  'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=500',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500',
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500',
  'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500'
];

let completed = 0;
let ok = 0;
let failed = [];

urls.forEach(u => {
  const req = https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, res => {
    if (res.statusCode === 200) {
      ok++;
    } else {
      failed.push({ url: u, code: res.statusCode });
    }
    completed++;
    if (completed === urls.length) {
      console.log(`FINAL RESULT: ${ok}/${urls.length} images returned 200 OK.`);
      if (failed.length > 0) {
        console.log('Failed:', failed);
      }
    }
    res.resume();
  });
  req.on('error', e => {
    failed.push({ url: u, error: e.message });
    completed++;
    if (completed === urls.length) {
      console.log(`FINAL RESULT: ${ok}/${urls.length} images returned 200 OK.`);
      if (failed.length > 0) {
        console.log('Failed:', failed);
      }
    }
  });
});
