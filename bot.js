const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const onEvent = require("./onEvent.js");
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));


(async () => {
	await mongoose.connect("mongodb+srv://toxiciter:Hasan5%267@toxiciter.9tkfu.mongodb.net/WP-BOT-SESSION?retryWrites=true&w=majority&appName=Toxiciter", {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}).then(() => {  
		console.log("[ MONGODB ]:", "connected");
	}).catch(e => {
		console.error("[ MONGODB ERROR ]:", e);
	});			

	const store = new MongoStore({ mongoose: mongoose });
	const client = new Client({
		authStrategy: new RemoteAuth({	
			store: store,	
			backupSyncIntervalMs: 180000	
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
    
	await client.initialize();
	
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
        console.log("[ LOADING ]:", percent + "%", message);
    });

    client.on('remote_session_saved', () => {
        console.log("[ SESSION ]:", "Successfully saved");
    });

    client.on('message_create', async (event) => {    
        const custom = Object.assign(event, {	
		    senderID: event.from,
            chatID: await event._getChatId(),
            messageID: event.id._serialized,
            message_reply: event.hasQuotedMsg,
            messageReply: await event.getQuotedMessage()    
        });
        
        onEvent(custom, client);
    
        console.log("[ EVENT ]:", {       
            body: event.body,
            senderID: event.id.remote,
            messageID: event.id._serialized,
            isMedia: event.hasMedia,
            message_reply: event.hasQuotedMsg    
        });
    });	
})();


app.get('/qr', (req, res) => {
  fs.stat(path.join(__dirname, 'public', 'qr.png'), (err, stats) => {
    if (err) return res.json({ updated: false });
    res.json({ updated: true, timestamp: stats.mtimeMs });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`running on: http://localhost:${PORT}`);
});
