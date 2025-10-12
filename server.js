const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { dataType } = require("./utils");
const onEvent = require("./onEvent.js");

const app = express();

// public ফোল্ডারকে static হিসেবে serve করা
app.use(express.static(path.join(__dirname, 'public')));

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.initialize();

let pairingCodeRequested = false;

client.on('qr', async (qr) => {
  console.log('[ QR RECEIVED ]:', qr);

  try {
    // QR কোড ইমেজ ডাউনলোড করা
    const { data } = await axios.get(`https://quickchart.io/qr?text=${encodeURIComponent(qr)}`, { responseType: "stream" });
    const qrPath = path.join(__dirname, "public", "qr.png");
    const writer = fs.createWriteStream(qrPath);
    data.pipe(writer);

    writer.on('finish', async () => {
      console.log('QR saved at:', qrPath);

      // Pairing code সক্রিয় করা
      const pairingCodeEnabled = true;
      if (pairingCodeEnabled && !pairingCodeRequested) {
        const pairingCode = await client.requestPairingCode('+8801843152929'); // এখানে তোমার ফোন নাম্বার দাও
        console.log('Pairing code enabled, code:', pairingCode);
        pairingCodeRequested = true;
      }
    });

  } catch (error) {
    console.error('QR generate error:', error);
  }
});

client.on('ready', () => {
  console.log('✅ Client is ready!');
});

client.on('authenticated', () => {
  console.log('✅ AUTHENTICATED');
});

client.on('auth_failure', (msg) => {
  console.error('❌ AUTH FAILURE:', msg);
});

client.on('loading_screen', (percent, message) => {
  console.log("[ LOADING ]:", percent, message);
});

client.on('message_create', async (event) => {
  console.log('[ 📩 MESSAGE RECEIVED ]:', event.body);
  onEvent(event, client);
});

// সার্ভার চালু করা
app.get('/', (req, res) => {
  fs.stat(path.join(__dirname, 'public', 'qr.png'), (err, stats) => {
    if (err) return res.json({ updated: false });
    res.json({ updated: true, timestamp: stats.mtimeMs });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 WebUI running on: http://localhost:${PORT}`);
});
