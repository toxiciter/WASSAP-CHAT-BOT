const { commands } = global.bot;

module.exports = {
  config: {
    name: "help",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "",
    category: "",
    guide: ""
  },
  logic: async ({ api, event, args }) => {
    try {
      const cmds = [...commands.keys()];
      let message = "COMMAND LIST\n\n";
      for (cmd of cmds) {
        const config = (commands.get(cmd)).config;
        message += cmd + \n"USAGE: " + config.guide\n;
      };
      api.sendMessage(message, event.senderID, event.messageID);
      
    } catch (e) {
      throw e;
    }
  }
};
