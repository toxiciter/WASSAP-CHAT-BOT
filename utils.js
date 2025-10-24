const fs = require("fs");
const { URL } = require("url");
const path = require("path");
const { whiteList } = require(path.join(__dirname, "API", "models", "mongodb.js"));


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
            const media = event.message_reply && event.messageReply.hasMedia ? await event.messageReply.downloadMedia() : await event.downloadMedia();
            const ext = media.mimetype.startsWith("image") ? ".jpg" : ".mp4";
            const fileName = "file_" + Date.now() + ext;
            const imagePath = path.join(__dirname, "public", fileName);       
            fs.writeFileSync(imagePath, media.data, { encoding: "base64" });
            setTimeout(() => {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`❌ Error deleting ${filename}:`, err.message);
                    } else {
                        console.log(`✅ Deleted file: ${filename}`);
                    }
                });
            }, 5 * 1000);
            return "https://wassap-chat-bot.onrender.com/" + fileName;     
        } catch (e) {                
            throw e;      
        }    
    },

    async file(event) {
        try {
            const media = event.message_reply && event.messageReply.hasMedia ? await event.messageReply.downloadMedia() : await event.downloadMedia();
            const ext = media.mimetype.startsWith("image") ? ".jpg" : ".mp4";
            const fileName = "file_" + Date.now() + ext;
            const imagePath = path.join(__dirname, "public", fileName);       
            fs.writeFileSync(imagePath, media.data, { encoding: "base64" });
            setTimeout(() => {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`❌ Error deleting ${filename}:`, err.message);
                    } else {
                        console.log(`✅ Deleted file: ${filename}`);
                    }
                });
            }, 5 * 1000);
            return imagePath;
        } catch (e) {
            throw e;
        }
    }
};

function errorMessage(e) {
  let message = `Error: ${e.name || 'Unknown'}\n`;
  message += `${e.message || 'no message'}\n\n`;

  // Axios specific error
  if (e.isAxiosError) {
    if (e.response) {
      message += `${e.response.status}\n`;
      message += `${JSON.stringify(e.response.data, null, 2)}\n\n`;
    } else if (e.request) {
      message += `${e.request}\n\n`;
    }
  }

  message += `${e.stack || 'No stack available'}`;

  return message;
};


const wl = {
  async add(uid) {  
    const data = await whiteList.findOne() || await whiteList.create({});
    if (!data.whitelisted.includes(uid)) {
      data.whitelisted.push(uid);
      await data.save();
      console.log(`✅ whitelisted: ${uid}`);
    } else {
      console.log(uid, "Already in whitelist!");
    }
  },

  async remove(uid) {
    const data = await whiteList.findOne();
    if (!data) return console.log("No whitelist found!");
      data.whitelisted = data.whitelisted.filter(x => x !== uid);
      await data.save();
      console.log(`❌ blacklisted: ${uid}`); 
  },
  async list() {
    const data = await whiteList.findOne();
    return data ? data.whitelisted : [];
  }
};


module.exports = {
    dataType,
    getMedia,
    errorMessage,
    wl
};
