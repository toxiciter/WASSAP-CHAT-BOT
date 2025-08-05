const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { dataType } = require("./utils");

const client = new Client();

client.on('ready', () => {
    console.log('[ CLIENT ]: Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();
global.client = client;

async function event() {
  client.on('message_create', message => {
	console.log(message);
    return message;
});
};

async function sendMessage(body, chatID, replyMessage, attachment) {
	let media;
	if (dataType(attachment) === "url") {
		media = await MessageMedia.fromUrl(attachment);
	} else {
		media = await MessageMedia.fromFilePath(attachment);
	}
	if (attachment) {
		await client.sendMessage(chatID, media, { caption: body ? body : "" });
	}
         await client.sendMessage(chatID, body);
        if (replyMessage) {
               await replyMessage(body);
	}
};


module.exports = {
	event,
	sendMessage
}
