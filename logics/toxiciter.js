const toxiciter = require("../API/toxiciter.js");

module.exports = {
  config: {
    name: "toxiciter",
    version: "2.0",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    countDown: 0,
    role: 0,
    description: {
      en: "A friendly ai chat bot",
    },
    category: "AI",
  },

  logic: async function ({}) {},

  reply: async function ({ api, event, cmdName}) {
    const ask = event.body;

    if (!ask) return;

    try {
      const toxic = await toxiciter(ask, event.senderID);
      api.sendMessage(toxic, event.chatID, event.messageID).then((info) => {
        global.onReply.set(info.messageID, {
          cmdName,
          messageID: info.messageID,
          senderID: event.senderID,
        });
      });
    } catch (e) {
      api.sendMessage("Hey, many users are using me right now, so I’m currently displaced. If you want to talk to me, please try again after 24 hours.", event.chatID, event.messageID);
    }
  },

  chat: async function ({ api, event, cmdName }) {
    const senderID = event.senderID;
    const ask = event.body;

    if (!ask || (!ask.toLowerCase().startsWith("bot") && !ask.toLowerCase().startsWith("toxiciter") && !ask.toLowerCase().startsWith("bby") && !ask.toLowerCase().startsWith("baby") && !ask.toLowerCase().startsWith("hie"))) {
      return;
    }

    try {
      const toxic = await toxiciter(ask, senderID);
      api.sendMessage(toxic, event.chatID, event.messageID).then((info) => {
        global.onReply.set(info.messageID, {
          cmdName,
          messageID: info.messageID,
          senderID: event.senderID,
        });
      });
    } catch (error) {
      api.sendMessage(`Hey, many users are using me right now, so I’m currently displaced. If you want to talk to me, please try again after 24 hours.`, event.chatID, event.messageID);
    }
  },
};
