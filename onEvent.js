const msg = require("./sendMessage.js");
const { getMediaUrl } = require("./utils.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");
const serverUrl = "https://wassap-chat-bot.onrender.com/";

module.exports = async (event, client) => {
    const sendMessage = msg(event, client);

    if (event.body.toLowerCase() === 'ping') {
        event.reply('pong!');
    } else if (event.body.toLowerCase() === 'send pic') {
        const m = MessageMedia.fromUrl("https://www.noobx.ct.ws/hasan/hasan.jpg");
        client.sendMessage(event.from, m);
    }

    if (event.body.toLowerCase().startsWith('eval')) {
        try {
            const code = event.body.split(' ').slice(1).join(' ');
            const result = eval(code);
            event.reply("✅ Eval Result:\n" + result);
        } catch (err) {
            event.reply("❌ Eval Error:\n" + err.message);
        }
    }
 
    if (event.body.toLowerCase().startsWith("edit")) {
        try {
            const prompt = event.body.split(' ').slice(1).join(' ');
            if (!prompt) {
                await sendMessage("Please provide a prompt with an image...!!", event.from, event.id._serialized);
            } else if (event.hasMedia) {
                const mediaUrl = await getMediaUrl(event);
                const { data } = await axios.get(`https://www.noobx.ct.ws/api/edit?url=${encodeURIComponent(mediaUrl)}&prompt=${encodeURIComponent(prompt)}`);
                await sendMessage({ attachment: data.url, body: "Ei ne bukachuda...!!🥸"
                                  }, event.from, event.id._serialized);
            } else {
                await sendMessage("Kire bukachuda pic ke dibe re bukachuda...!", event.from, event.id._serialized);
            }
        } catch (e) {
            event.reply(e.message);
        }
    } else if (event.body.toLowerCase().startsWith("gpt")) { 
        try {
            if (event.hasMedia) {
               const url = await getMediaUrl(event);
            }
            const prompt = event.body.split(' ').slice(1).join(' ') || "hey";
            const { data } = await axios.get(`https://www.noobx.ct.ws/api/gpt-pro?text=${encodeURIComponent(prompt)}&uid=${event.from}&imageUrl=${url}`);
            event.reply(data.response);
        } catch(e) {  
            event.reply(e.message)
        }
    }
}
