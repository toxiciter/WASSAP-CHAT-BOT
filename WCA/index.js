const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { dataType } = require("./utils");

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('[ CLIENT ]: Client is ready!');
});

client.initialize();
global.client = client;

function event() {
    client.on('message_create', async message => {
        console.log('[ MESSAGE RECEIVED ]:', message.body);
        return message;
    });
}
const event = event();

async function sendMessage(msg, chatID, replyToMessage) {
	if (!typeof chatID === "string" || !typeof chatID === "object") {
		throw new Error("chatID must be an array or string")
	} else if (array.isArray(msg) && (!typeof msg.attachment === "string" || !typeof msg.attachment === "object")) {
		throw new Error("attachment must be a string  or an object");
	}
    try {
        if (array.isArray(msg)) {
            let media;
            if (dataType(msg.attachment) === "url") {
                media = await MessageMedia.fromUrl(msg.attachment);
            } else {
                media = await MessageMedia.fromFilePath(msg.attachment);
            }
            if (array.isArray(chatID)) {
			Promise.all(chatID.map(id => client.sendMessage(id, media, { caption: msg.body || "" })));
	    } else {
			await client.sendMessage(chatID, media, { caption: msg.body || "" });
	    }
        } else if (typeof msg === "string") {
            if (array.isArray(chatID)) {
			Promise.all(chatID.map(id => client.sendMessage(id, msg)));
	    } else {
			await client.sendMessage(chatID, msg);
	    }
        }

        if (replyToMessage) {
            await event.reply(body);
        }

    } catch (err) {
        console.error('[ ERROR in sendMessage ]:', err.message);
    }
}

if (event.body && event.body.toLowerCase().startsWith("eval")){
     return eval(event.body.split(' ').slice(1).join(' '));
}
