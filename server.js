const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { dataType } = require("./utils");
const onEvent = require("./onEvent.js");
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  }
});

client.initialize();

let pairingCodeRequested = false;
client.on('qr', async (qr) => {
  console.log('QR RECEIVED', qr);

    const pairingCodeEnabled = true;
    if (pairingCodeEnabled && !pairingCodeRequested) {
        const pairingCode = await client.requestPairingCode('+8801843152929'); // enter the target phone number
        console.log('Pairing code enabled, code: '+ pairingCode);
        pairingCodeRequested = true;
    }
  try {
    const url = await qrcode.toDataURL(qr);
    io.emit('qr', { src: url, text: qr });
    console.log('QR generated and emitted');
  } catch (err) {
    console.error('QR toDataURL error', err);
  }
});

client.on('ready', () => {
  console.log('Client is ready!');
  io.emit('status', { state: 'ready' });
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
  io.emit('status', { state: 'authenticated' });
});

client.on('auth_failure', (msg) => {
  console.error('AUTH FAILURE', msg);
  io.emit('status', { state: 'auth_failure', message: msg });
});

client.on('loading_screen', (percent, message) => {
  io.emit('loading', { percent, message });
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('request-restart', async () => {
    try {
      await client.pupPage.reload({ ignoreCache: true });
      socket.emit('toast', 'Puppeteer page reloaded');
    } catch (e) {
      socket.emit('toast', 'Reload failed: ' + e.message);
    }
  });
});

client.on('message_create', async event => {
    console.log('[ 📩 MESSAGE_RECEIVED ]:', event.body);
    onEvent(event, client);
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});