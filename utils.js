const fs = require("fs");
const { URL } = require("url");
const path = require("path");

function dataType(input) {
    if (Array.isArray(input)) {
        const allUrls = input.every(
            item => typeof item === "string" && /^(https?:\/\/[^\s]+)$/i.test(item)
        );
        if (allUrls) return "url";
        return "array";
    }

    if (input === null) return "null";
    if (input instanceof Buffer) return "buffer";
    if (typeof input === "object") return "object";
    if (typeof input === "number") return "number";
    if (typeof input === "boolean") return "boolean";

    if (typeof input === "string") {
        if (/^(https?:\/\/[^\s]+)$/i.test(input)) return "url";
        if (/[\/\\]/.test(input)) return "path";
        return "string";
    }

    return typeof input;
}


const getMedia = { 
    async url(event) {
        try {
            const media = event.message_reply ? await event.messageReply.downloadMedia() : await event.downloadMedia();
            const ext = media.mimetype.startsWith("image") ? ".jpg" : ".mp4";
            const fileName = "file_" + Date.now() + ext;
            const imagePath = path.join(__dirname, "public", fileName);       
            fs.writeFileSync(imagePath, media.data, { encoding: "base64" });
            return "https://wassap-chat-bot.onrender.com/" + fileName;     
        } catch (e) {                
            throw e;      
        }    
    },

    async file(event) {
        try {
            const media = event.message_reply ? await event.messageReply.downloadMedia() : await event.downloadMedia();
            const ext = media.mimetype.startsWith("image") ? ".jpg" : ".mp4";
            const fileName = "file_" + Date.now() + ext;
            const imagePath = path.join(__dirname, "public", fileName);       
            fs.writeFileSync(imagePath, media.data, { encoding: "base64" });
            return imagePath;
        } catch (e) {
            throw e;
        }
    }
};

module.exports = {
  dataType,
  getMedia
};
