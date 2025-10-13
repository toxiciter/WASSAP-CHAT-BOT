const msg = require("./sendMessage.js");
const { getMediaUrl } = require("./utils.js");
const axios = require("axios");
const { MessageMedia } = require("whatsapp-web.js");

const serverUrl = "https://wassap-chat-bot.onrender.com/";

module.exports = async (event, client) => {
    const sendMessage = msg(event, client);
    const body = event.body?.toLowerCase().trim();

    if (body === "ping") {
        return event.reply("pong!");
    }

    if (body === "send pic") {
        try {
            const media = await MessageMedia.fromUrl("https://www.noobx.ct.ws/hasan/hasan.jpg");
            await client.sendMessage(event.from, media);
        } catch (e) {
            return event.reply("❌ Failed to send picture: " + e.message);
        }
    }


    if (body.startsWith("eval")) {
        try {
            const code = event.body.split(" ").slice(1).join(" ");
            const result = eval(code);
            await event.reply("✅ Eval Result:\n" + result);
        } catch (err) {
            await event.reply("❌ Eval Error:\n" + err.message);
        }
    }

    if (body.startsWith("edit")) {
        try {
            const prompt = event.body.split(" ").slice(1).join(" ");
            if (!prompt) {
                return sendMessage("Please provide a prompt with an image...!!", event.from, event.id._serialized);
            }

            if (event.hasMedia) {
                const mediaUrl = await getMediaUrl(event);
                const { data } = await axios.get(
                    `https://www.noobx.ct.ws/api/edit?url=${encodeURIComponent(mediaUrl)}&prompt=${encodeURIComponent(prompt)}`
                );

                return sendMessage(
                    { attachment: data.url, body: "Ei ne bukachuda...!!🥸" },
                    event.from,
                    event.id._serialized
                );
            } else {
                return sendMessage("Kire bukachuda pic ke dibe re bukachuda...!", event.from, event.id._serialized);
            }
        } catch (e) {
            return event.reply("❌ Edit Error: " + e.message);
        }
    }

    if (body.startsWith("gpt")) {
        try {
            let url = "";
            if (event.hasMedia) {
                url = await getMediaUrl(event);
            }

            const prompt = event.body.split(" ").slice(1).join(" ") || "hey";
            const { data } = await axios.get(
                `https://www.noobx.ct.ws/api/gpt-pro?text=${encodeURIComponent(prompt)}&uid=${event.from}&imageUrl=${encodeURIComponent(url)}`
            );

            await event.reply(data.response);
        } catch (e) {
            await event.reply("❌ GPT Error: " + e.message);
        }
    }
};
