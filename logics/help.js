module.exports = {
  config: {
    name: "help",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Show all available commands",
    category: "system",
    guide: "{pn}\n{pn} <cmdname> to see how to use and details of that command"
  },

  logic: async ({ api, event, args, commands }) => {
    try {
      const cmds = [...commands.keys()];
      if (args.length && cmds.includes(args[0].toLowerCase())) {
        const { config } = commands.get(args[0].toLowerCase());
        const response = `╭── 𝑵𝑨𝑴𝑬 ────⭓\n` +
          `│ ${config.name}\n` +
          `├── 𝑰𝑵𝑭𝑶\n` +
          `│ 𝐷𝑒𝑠𝑐𝑟𝑖𝑝𝑡𝑖𝑜𝑛: ${config.description}\n` +
          `│ 𝑉𝑒𝑟𝑠𝑖𝑜𝑛: ${config.version || "1.0"}\n` +
          `│ 𝑇𝑖𝑚𝑒 𝑃𝑒𝑟 𝐶𝑜𝑚𝑚𝑎𝑛𝑑: ${config.countDown || 1}s\n` +
          `│ 𝐴𝑢𝑡ℎ𝑜𝑟: ${config.author}\n` +
          `├── 𝑼𝑺𝑨𝑮𝑬\n` +
          `│ ${config.guide}\n` +
          `├── 𝑵𝑶𝑻𝑬𝑺\n` +
          `│ 𝑇ℎ𝑒 𝑐𝑜𝑛𝑡𝑒𝑛𝑡 𝑖𝑛𝑠𝑖𝑑𝑒 ♡︎ 𝐇𝐀𝐒𝐀𝐍 ♡︎ 𝑐𝑎𝑛 𝑏𝑒 𝑐ℎ𝑎𝑛𝑔𝑒𝑑\n` +
          `│ ♕︎ 𝐎𝐖𝐍𝐄𝐑 ♕︎:☠︎︎ 𝙃𝘼𝙎𝘼𝙉 ☠︎︎\n` +
          `╰━━━━━━━❖`;
        api.sendMessage(response, event.chatID, event.messageID)
      }
      let message = "╔══════════════╗\n🔹 𝑪𝑶𝑴𝑴𝑨𝑵𝑫 𝑳𝑰𝑺𝑻 🔹\n╚══════════════╝\n";

      const categories = {};
      for (const cmd of cmds) {
        const { config } = commands.get(cmd);
        const category = config.category || "Uncategorize";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(config.name);
        //message += `🔹 ${cmd}\n`;
        //message += `📘 Usage: ${config.guide || "No guide"}\n\n`;
      }
      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          message += `\n╭────────────⭓\n『 ${category.toUpperCase()} 』\n`;

          const names = categories[category].commands.sort();
          names.forEach((item) => {
            message += `‎‎𖤍 ${item}\n`;
          });
          message += `\n╰────────⭓`;
        }
      });
      message += "\nType /help <command Name> - to see how to use and details of that command..!"

      api.sendMessage(message.trim(), event.chatID, event.messageID);
      
    } catch (e) {
      throw e;
    }
  }
};
                        
