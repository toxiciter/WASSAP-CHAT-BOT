const fs = require("fs");
const path = require("path");
const { getMediaUrl } = require("./utils.js");
const whiteList = require(path.join(__dirname, "API", "models", "WhiteListed.js"));

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
      console.log(`❌ unwhitelisted: ${uid}`); 
  },
  async list() {
    const data = await whiteList.findOne();
    return data ? data.whitelisted : [];
  }
};




const {
  smsboomber, edit, editpro, upscale_2, imgur,
  dalle_3, imagine, imagine_2, art, img2img,
  text2song, swap, tools, removebg, alldl,
  prompt, prompt_2, gpt, flux, changebg, flag,
  font, quiz, album, permission, xnxx, yt, tiktokVideo, grok
      } = require(path.join(__dirname, "API", "hasan.js"));

(async () => {
  const owner = "8801843152929@c.us";
  await wl.add(owner);
})();


global.onReply = new Map();
const commands = new Map();

// [ LOAD COMMAND ]     
const cmdsPath = path.join(__dirname, "logics");  
fs.readdirSync(cmdsPath).forEach(file => {   
  if (file.endsWith(".js")) {           
    const cmd = require(path.join(cmdsPath, file));      
    if (cmd?.config?.name && typeof cmd.logic === "function") {     
      commands.set(cmd.config.name.toLowerCase(), cmd);    
      console.log("[ COMMAND LOADED ]:", cmd.config.name);        
    }          
  }      
});


module.exports = async (event, client) => {
  const sendMessage = require("./sendMessage.js")(event, client);
  const prefix = "/";
  
  
  const api = {
    sendMessage, getMediaUrl, smsboomber, edit, editpro, upscale_2, imgur,
    dalle_3, imagine, imagine_2, art, img2img,
    text2song, swap, tools, removebg, alldl,
    prompt, prompt_2, gpt, flux, changebg, flag,
    font, quiz, album, permission, xnxx, yt, tiktokVideo, grok 
  };
  

  


    //[ CHECK PERMISSION ]
    //if (!whitelisted.includes(event.from)) return;
    const { body, senderID, messageID } = event;
    if(!body) return;

  
    // [ LOGIC ]
  try {
    if (body.startsWith(prefix)) {
      const withoutPrefix = body.slice(prefix.length).trim();
      const split = withoutPrefix.split(/\s+/);
      const cmdName = split[0].toLowerCase();
      const args = split.slice(1);
      const cmd = commands.get(cmdName);

      if (!cmd) {
        return sendMessage(
          "ಠ⁠ᴥ⁠ಠ I don't have the command: " + cmdName,
          senderID,
          messageID
        );
      }
      await cmd.logic({ api, event, args, cmdName, wl });
      return;
    }
  } catch (e) {
    throw new Error(`[ LOGIC_ERROR ]: ${e}`);
  }
    

    //[ REPLY ]
  try {
    if (event.hasQuotedMsg) {
      const quoted = await event.getQuotedMessage();
      const Reply = global.onReply.get(quoted.id._serialized);
      if (Reply) {
        const cmd = commands.get(Reply.cmdName);
        if (cmd && typeof cmd.reply === "function") {
          return cmd.reply({ Reply, api, event, cmdName });
        }
      }
    } 
  } catch (e) {
    throw new Error(`[ REPLY_ERROR ]: ${e}`);
  }
};
