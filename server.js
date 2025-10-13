const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { dataType } = require("./utils");
const onEvent = require("./onEvent.js");
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://toxiciter:Hasan5&7@toxiciter.9tkfu.mongodb.net/WP-BOT-SESSION?retryWrites=true&w=majority&appName=Toxiciter").then(() => {
    const store = new MongoStore({ mongoose: mongoose });
});
  
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const client = new Client({
  authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        }),
  puppeteer: {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-zygote'
  ]
 }
});

client.initialize();

client.on('qr', async (qr) => {
  console.log('[ QR RECEIVED ]:', qr);

  try {
    const { data } = await axios.get(`https://quickchart.io/qr?text=${encodeURIComponent(qr)}`, { responseType: "stream" });
    const qrPath = path.join(__dirname, "public", "qr.png");
    const writer = fs.createWriteStream(qrPath);
    data.pipe(writer);

    writer.on('finish', async () => {
      console.log('QR saved at:', qrPath);
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
  console.log("body:", event.body);
  console.log("from:", event.from);
  console.log("to:", event.to);
  console.log("messageID:", event.id._serialized);
  console.log("hasMedia:", event.hasMedia);
  onEvent(event, client);
});


app.get('/qr', (req, res) => {
  fs.stat(path.join(__dirname, 'public', 'qr.png'), (err, stats) => {
    if (err) return res.json({ updated: false });
    res.json({ updated: true, timestamp: stats.mtimeMs });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 WebUI running on: http://localhost:${PORT}`);
});
