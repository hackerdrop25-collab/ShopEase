const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║   🎉 ShopEase Professional Website Running       ║
╚══════════════════════════════════════════════════╝

  ✅ Website: http://localhost:${PORT}
  📦 Backend: http://localhost:5000
  
  🌐 Open your browser and visit:
     👉 http://localhost:${PORT}

  Features:
  ✅ Professional Design
  ✅ Shopping Cart
  ✅ Product Search & Filters
  ✅ Payment Integration
  ✅ Real Prices in Rupees
  ✅ Mobile Responsive

  Press Ctrl+C to stop
    `);
});
