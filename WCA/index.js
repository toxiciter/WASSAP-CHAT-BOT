const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('ready', () => {
    console.log('[ CLIENT ]: Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();


async function event() {
  client.on('message_create', message => {
	console.log(message);
    return message;
});
};

async function sendMessage(body, chatID, replyMessage, attachment) {
  client.sendMessage(chatID, body);
  if (replyMessage) {
    replyMessage(body);
  }
};
