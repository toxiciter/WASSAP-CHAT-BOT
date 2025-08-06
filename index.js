const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { dataType } = require("./utils");
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('[ CLIENT ]: Client is ready!');
});

const pairingCode = await client.requestPairingCode('01843152929'); // enter the target phone number
        console.log('Pairing code enabled, code: '+ pairingCode);

function onEvent(message) {
    console.log('[CUSTOM EVENT] Message received:', message.body);

    // Example 1: Auto-reply
    if (message.body.toLowerCase() === 'ping') {
        message.reply('pong!');
    }

    // Example 2: Eval code
    if (message.body.startsWith('eval ')) {
        try {
            const code = message.body.split(' ').slice(1).join(' ');
            const result = eval(code);
            message.reply("✅ Eval Result:\n" + result);
        } catch (err) {
            message.reply("❌ Eval Error:\n" + err.message);
        }
    }

    // Example 3: Send media later if needed
    // ...
}

// Listen to every incoming message
client.on('message_create', async message => {
    console.log('[ MESSAGE_RECEIVED ]:', message.body);
    onEvent(message); // 👈 এইখানে মেইন function call হচ্ছে
});

client.initialize();
global.client = client;

async function sendMessage(msg, chatID, replyToMessage) {
	if (!(typeof chatID === "string" || typeof chatID === "object")) {
		throw new Error("chatID must be an array or string")
	} else if (Array.isArray(msg) && !(typeof msg.attachment === "string" || typeof msg.attachment === "object")) {
		throw new Error("attachment must be a string  or an object");
	}
    try {
        if (Array.isArray(msg)) {
            let media;
            if (dataType(msg.attachment) === "url") {
                media = await MessageMedia.fromUrl(msg.attachment);
            } else {
                media = await MessageMedia.fromFilePath(msg.attachment);
            }
            if (Array.isArray(chatID)) {
			Promise.all(chatID.map(id => client.sendMessage(id, media, { caption: msg.body || "" })));
	    } else {
			await client.sendMessage(chatID, media, { caption: msg.body || "" });
	    }
        } else if (typeof msg === "string") {
            if (Array.isArray(chatID)) {
			Promise.all(chatID.map(id => client.sendMessage(id, msg)));
	    } else {
			await client.sendMessage(chatID, msg);
	    }
        }

        if (replyToMessage) {
            //await event.reply(body);
        }

    } catch (err) {
        console.error('[ ERROR in sendMessage ]:', err.message);
    }
}
