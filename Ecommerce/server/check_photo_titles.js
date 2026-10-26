const https = require('https');

function followRedirect(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = 'https://unsplash.com' + loc;
        https.get(loc, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res2 => {
          let html = '';
          res2.on('data', d => { if (html.length < 40000) html += d; });
          res2.on('end', () => {
            const m = html.match(/<title>([^<]+)<\/title>/i);
            resolve({ loc, title: m ? m[1] : 'No title' });
          });
        }).on('error', e => resolve({ error: e.message }));
      } else {
        resolve({ loc: url, title: 'No redirect' });
      }
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function run() {
  const ids = [
    'photo-1599058917212-d750089bc07e', // skipping rope current
    'photo-1540747913346-19e32dc3e97e', // cricket 1
    'photo-1593766788306-28561086694e', // cricket 2
    'photo-1613918108466-292b78a8ef95', // badminton
    'photo-1618666012174-83b441c0bc76', // harry potter
    'photo-1553729459-efe14ef6055d', // psychology / finance
    'photo-1584735935682-2f2b69dff9d2', // dumbbells
    'photo-1579952363873-27f3bade9f55', // football
    'photo-1559056199-641a0ac8b55e', // duffle bag
    'photo-1524805444758-089113d48a6d', // analog watch
    'photo-1544717302-de2939b7ef71', // kindle
    'photo-1624222247344-550fb60583dc', // belt
    'photo-1576485290814-1c72aa4bbb8e', // kettle
    'photo-1584269600464-37b1b58a9fe7', // pot / pressure cooker
    'photo-1546069901-ba9599a7e63c', // lunch box
    'photo-1527515637462-cff94eecc1ac'  // vacuum cleaner
  ];

  for (const id of ids) {
    const res = await followRedirect(`https://unsplash.com/photos/${id}`);
    console.log(`${id} -> ${res.title?.substring(0, 100)}`);
  }
}
run();
