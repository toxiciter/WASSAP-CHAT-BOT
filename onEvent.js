const msg = require("./sendMessage.js");
const { getMediaUrl } = require("./utils.js");
const axios = require("axios");

module.exports = async (event, client) => {
    const sendMessage = msg(event, client);
    /*const body = event.body?.toLowerCase().trim();

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
    }*/

    const prefix = "/";
    const commands = new Map();
    const api = {
        sendMessage,
        getMediaUrl
    };

    const cmdsPath = path.join(__dirname, "logics");        
    fs.readdirSync(cmdsPath).forEach(file => {
    if (file.endsWith(".js")) {
        const cmd = require(path.join(cmdsPath, file));
        if (cmd && cmd.config && cmd.logic) {
            commands.set(cmd.config.name, cmd);
            console.log("Loaded command:", cmd.config.name);
        } 
    }
    });

    try {
        const { body, from } = event;
        if (body.startsWith(prefix)) {
            const withoutPrefix = body.slice(prefix.length).trim();
            const split = withoutPrefix.split(/\s+/);
            const cmdName = split[0].toLowerCase();
            const args = split.slice(1);
            const isCmd = await commands.get(cmdName);
            if(!isCmd) {
                await sendMessage("😿 | I don't have any command like this :" + cmdName, event.from, event.id._serialized);          
            }   
            await cmd.logic({ api, event, args, cmdName });
            return;
        }

        global.onReply = new Map();


        /*global.onReply.set(event.id._serialized, {
            cmdName: "",
            senderID: "",
            code:
        })*/

        if (event.hasQuotedMsg) {
            const Reply = await global.onReply.get(event.id._serialized);
            if (Reply) {
                const cmd = commands.get(Reply.cmdName);
                if (cmd && typeof cmd.reply === "function") {
                    return cmd.reply({ Reply, api, event, args, cmdName });
                }}
        }
    } catch (e) {
        throw new Error(e);
    }
};
