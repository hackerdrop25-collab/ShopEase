const fs = require('fs');
const prods = require('./all_products.json');

const lines = prods.map(p => {
  const img = p.images && p.images[0] ? p.images[0].url : p.imageUrl;
  return `${p.category} | ${p.name} | ${img}`;
});

fs.writeFileSync('product_list.txt', lines.join('\n'));
console.log('Written ' + lines.length + ' products to product_list.txt');
