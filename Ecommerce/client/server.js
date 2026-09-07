const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
let PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function startServer(p) {
  const server = app.listen(p, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║   ✨ ShopEase Exponential Dark Tech Web Server    ║
╚══════════════════════════════════════════════════╝

  ✅ Website running at: http://localhost:${p}
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${p} in use, trying port ${p + 1}...`);
      startServer(p + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(PORT);

