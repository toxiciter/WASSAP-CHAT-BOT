const fs = require("fs");
const path = require("path");
const { getMedia, wl, errorMessage } = require("./utils.js");
const prefix = "/";


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
try {
  const cmdsPath = path.join(__dirname, "logics");
  const files = fs.readdirSync(cmdsPath).filter(f => f.endsWith(".js"));
  
  for (const file of files) {
    const filePath = path.join(cmdsPath, file);
    try {
      delete require.cache[require.resolve(filePath)];
      const cmd = require(filePath);
      
      if (!cmd?.config?.name) {
        console.warn(`Missing "config.name" in command: ${file}`);
        continue;
      }
      
      if (typeof cmd.logic !== "function" || !cmd.logic) {
        console.warn(`Missing "logic" function in command: ${file}`);
        continue;
      }

      if (cmd.config.guide && typeof cmd.config.guide === "string") {
        cmd.config.guide = cmd.config.guide.replace(/{pn}/g, prefix + cmd.config.name);
      }
      
      commands.set(cmd.config.name.toLowerCase(), cmd);
      console.log(`[ COMMAND LOADED ]: ${cmd.config.name}`);
    } catch (err) {
      console.error(`[ FAILED TO LOAD ]: ${file}`);
      if (err.name === "SyntaxError") {
        console.error(`   ↳ Syntax error in command: ${file}`);
      }
      console.error("   ↳", err);
    }
  }
} catch (outerErr) {
  console.error("[ COMMAND LOADER ERROR ]:", outerErr);
}
    

module.exports = async (event, client) => {
  const sendMessage = require("./sendMessage.js")(event, client);
  const whitelisted = await wl.list();
  global.bot = {
    client,
    commands
  };
  
  
  const api = {
    sendMessage, getMedia, smsboomber, edit, editpro, upscale_2, imgur,
    dalle_3, imagine, imagine_2, art, img2img,
    text2song, swap, tools, removebg, alldl,
    prompt, prompt_2, gpt, flux, changebg, flag,
    font, quiz, album, permission, xnxx, yt, tiktokVideo, grok 
  };
  

    const { body, senderID, messageID } = event;
    if(!body) return;

  //[ CHECK PERMISSION ]
    //if(!whitelisted.includes(event.author)) return;


  try {
    // [ LOGIC ]
    if (body.startsWith(prefix)) {
      const withoutPrefix = body.slice(prefix.length).trim();
      const split = withoutPrefix.split(/\s+/);
      const cmdName = split[0].toLowerCase();
      const args = split.slice(1);
      const cmd = commands.get(cmdName);

      if (!cmd) {
        return sendMessage(
          `ಠ⁠ᴥ⁠ಠ Command "${cmdName}" does not exist..!`,
          senderID,
          messageID
        );
      }
      await cmd.logic({ api, event, args, cmdName, wl });
      return;
    };


    /*[ CHAT ]
    if (event.body) {
      
    }*/

    //[ REPLY ]
    if (event.message_reply) {
      const Reply = global.onReply.get(event.messageReply.id._serialized);
      if (Reply) {
        const cmd = commands.get(Reply.cmdName);
        if (cmd && cmd.reply && typeof cmd.reply === "function") {
          await cmd.reply({ Reply, api, event, cmdName: Reply.cmdName });
        }
      }
    };
  } catch (err) {
    console.error("[ ERROR IN COMMAND ]:", err);
    const eMsg = errorMessage(err);
    await api.sendMessage(eMsg, event.senderID, event.messageID);
  }
};
