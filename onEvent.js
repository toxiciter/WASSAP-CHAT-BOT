const fs = require("fs");
const path = require("path");
const msg = require("./sendMessage.js");
const { getMediaUrl } = require("./utils.js");
const {
  smsboomber, edit, editpro, upscale_2, imgur,
  dalle_3, imagine, imagine_2, art, img2img,
  text2song, swap, tools, removebg, alldl,
  prompt, prompt_2, gpt, flux, changebg, flag,
  font, quiz, album, permission, xnxx, yt, tiktokVideo, grok
      } = require(path.join(__dirname, "API", "hasan.js"));

global.onReply = new Map();

module.exports = async (event, client) => {
  const sendMessage = msg(event, client);
  const prefix = "/";
  const commands = new Map();
  const api = {
    sendMessage, getMediaUrl, smsboomber, edit, editpro, upscale_2, imgur,
    dalle_3, imagine, imagine_2, art, img2img,
    text2song, swap, tools, removebg, alldl,
    prompt, prompt_2, gpt, flux, changebg, flag,
    font, quiz, album, permission, xnxx, yt, tiktokVideo, grok 
  };

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

  try {
    const { body, senderID, messageID } = event;
    if(!body) return;

    // [ LOGIC ]
    if (body.startsWith(prefix)) {
      const withoutPrefix = body.slice(prefix.length).trim();
      const split = withoutPrefix.split(/\s+/);
      const cmdName = split[0].toLowerCase();
      const args = split.slice(1);
      const cmd = commands.get(cmdName);

      if (!cmd) {
        return sendMessage(
          "<3 I don't have the command: " + cmdName,
          senderID,
          messageID
        );
      }
      await cmd.logic({ api, event, args, cmdName });
      return;
    }
    

    //[ REPLY ]
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
    throw new Error(e.message);
  }
};
