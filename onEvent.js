const fs = require("fs");
const path = require("path");
const msg = require("./sendMessage.js");
const { getMediaUrl } = require("./utils.js");

global.onReply = new Map();

module.exports = async (event, client) => {
  const sendMessage = msg(event, client);
  const prefix = "/";
  const commands = new Map();
  const api = { sendMessage, getMediaUrl };

  // 🔹 Load all commands
  const cmdsPath = path.join(__dirname, "logics");
  fs.readdirSync(cmdsPath).forEach(file => {
    if (file.endsWith(".js")) {
      const cmd = require(path.join(cmdsPath, file));
      if (cmd?.config?.name && typeof cmd.logic === "function") {
        commands.set(cmd.config.name.toLowerCase(), cmd);
        console.log("Loaded command:", cmd.config.name);
      }
    }
  });

  try {
    const { body, from } = event;
    if (!body) return;

    // 🔹 Check if message is a command
    if (body.startsWith(prefix)) {
      const withoutPrefix = body.slice(prefix.length).trim();
      const split = withoutPrefix.split(/\s+/);
      const cmdName = split[0].toLowerCase();
      const args = split.slice(1);
      const cmd = commands.get(cmdName);

      if (!cmd) {
        return sendMessage(
          "😿 | I don't have any command like this: " + cmdName,
          from,
          event.id._serialized
        );
      }

      // Run command logic
      await cmd.logic({ api, event, args, cmdName });
      return;
    }

    // 🔹 Reply Handler
   /* if (event.hasQuotedMsg) {
      const quoted = await event.getQuotedMessage();
      const replyData = global.onReply.get(quoted.id._serialized);
      if (replyData) {
        const cmd = commands.get(replyData.cmdName);
        if (cmd && typeof cmd.reply === "function") {
          return cmd.reply({ Reply: replyData, api, event });
        }
      }
    }*/
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
