const { MessageMedia } = require('whatsapp-web.js');
const { dataType } = require("./utils.js")

module.exports = (event, client) => {
    return async (msg, chatID, messageReply) => {
    if (!(typeof chatID === "string" || typeof chatID === "object")) {
        throw new Error("chatID must be an array or string");
    }

    if (Array.isArray(msg) && !(typeof msg.attachment === "string" || typeof msg.attachment === "object")) {
        throw new Error("attachment must be a string or an object");
    }

    try {
        if (Array.isArray(msg)) {
            if (Array.isArray(msg.attachment)) {
                if (dataType(msg.attachment) === "url") {
                    await Promise.all(
                        msg.attachment.map(async url => {
                            const media = await MessageMedia.fromUrl(url);
                            await client.sendMessage(chatID, media, { caption: msg.body || "", quotedMessageId: messageReply || "" });
                        })
                    );
                } else {
                    await Promise.all(
                        msg.attachment.map(async file => {
                            const media = await MessageMedia.fromFilePath(file);
                            await client.sendMessage(chatID, media, { caption: msg.body || "", quotedMessageId: messageReply || "" });
                        })
                    );
                }
            } else {
                let media;        
                if (dataType(msg.attachment) === "url") {         
                    media = await MessageMedia.fromUrl(msg.attachment);      
                } else {            
                    media = await MessageMedia.fromFilePath(msg.attachment);         
                }
                if (Array.isArray(chatID)) {
                    await Promise.all(chatID.map(id => client.sendMessage(id, media, { caption: msg.body || "" })));
                } else {
                    await client.sendMessage(chatID, media, { caption: msg.body || "", quotedMessageId: messageReply || "" });            
                } 
            }
        } else if (typeof msg === "string") {
            if (Array.isArray(chatID)) {
                await Promise.all(chatID.map(id => client.sendMessage(id, msg)));
            } else {
                await client.sendMessage(chatID, msg, { quotedMessageId: messageReply || "" });
            }
        }

    } catch (err) {
        console.error('[ ❌ ERROR in sendMessage ]:', err.message);
    }
 }
}
