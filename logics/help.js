const { commands } = global.bot;

module.exports = {
  config: {
    name: "help",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Show all available commands",
    category: "system",
    guide: "{pn}"
  },

  logic: async ({ api, event, args }) => {
    try {
      const cmds = [...commands.keys()];
      let message = "📜 COMMAND LIST 📜\n\n";

      for (const cmd of cmds) {
        const config = commands.get(cmd).config;
        message += `🔹 ${cmd}\n`;
        message += `📘 Usage: ${config.guide || "No guide"}\n\n`;
      }

      api.sendMessage(message.trim(), event.senderID, event.messageID);
      
    } catch (e) {
      throw e;
    }
  }
};
