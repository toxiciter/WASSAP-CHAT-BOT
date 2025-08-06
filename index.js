const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { dataType } = require("./utils");

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    },
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
            ]
    }
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

// Pairing code only needs to be requested once
let pairingCodeRequested = false;
client.on('qr', async (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);

    // paiuting code example
    const pairingCodeEnabled = true;
    if (pairingCodeEnabled && !pairingCodeRequested) {
        const pairingCode = await client.requestPairingCode('01843152929'); // enter the target phone number
        console.log('Pairing code enabled, code: '+ pairingCode);
        pairingCodeRequested = true;
    }
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', async () => {
    console.log('READY');
    const debugWWebVersion = await client.getWWebVersion();
    console.log(`WWebVersion = ${debugWWebVersion}`);

    client.pupPage.on('pageerror', function(err) {
        console.log('Page error: ' + err.toString());
    });
    client.pupPage.on('error', function(err) {
        console.log('Page error: ' + err.toString());
    });
    
});

client.on('message_create', async message => {
    console.log('[ 📩 MESSAGE_RECEIVED ]:', message.body);
    onEvent(message);
});

 // ✅ Only one initialize

function onEvent(message) {
    console.log('[ 📥 CUSTOM EVENT ] Message received:', message.body);

    if (message.body.toLowerCase() === 'ping') {
        message.reply('pong!');
    }

    if (message.body.startsWith('eval ')) {
        try {
            const code = message.body.split(' ').slice(1).join(' ');
            const result = eval(code);
            message.reply("✅ Eval Result:\n" + result);
        } catch (err) {
            message.reply("❌ Eval Error:\n" + err.message);
        }
    }
}

global.client = client;

async function sendMessage(msg, chatID, replyToMessage) {
    if (!(typeof chatID === "string" || typeof chatID === "object")) {
        throw new Error("chatID must be an array or string");
    }

    if (Array.isArray(msg) && !(typeof msg.attachment === "string" || typeof msg.attachment === "object")) {
        throw new Error("attachment must be a string or an object");
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
                await Promise.all(chatID.map(id => client.sendMessage(id, media, { caption: msg.body || "" })));
            } else {
                await client.sendMessage(chatID, media, { caption: msg.body || "" });
            }
        } else if (typeof msg === "string") {
            if (Array.isArray(chatID)) {
                await Promise.all(chatID.map(id => client.sendMessage(id, msg)));
            } else {
                await client.sendMessage(chatID, msg);
            }
        }

    } catch (err) {
        console.error('[ ❌ ERROR in sendMessage ]:', err.message);
    }
}
