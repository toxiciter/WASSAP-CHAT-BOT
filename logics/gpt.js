module.exports = {
  config: {
    name: "gpt",
    version: "2.0",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    countDown: 0,
    description: "Auto reply using chatGPT AI",
    category: "AI",
    guide: "gpt on (for chat with chatGPT without prefix or messageReply! if it enable chatGPT will listen all of message you sent)\ngpt off ( for turn off all message listen )\n{pn} [your message]\n{pn} [your message] (with an image)\n{pn} [your message] (with reply of an image)"
  },

  activeUsers: new Set(),

  logic: async function ({ api, event, args, cmdName }) {
    const ask = args.join(" ") || "hie";
    const senderID = event.senderID;
    const url = event.messageReply?.hasMedia ? await api.getMedia.url(event) : event.hasMedia ? await api.getMedia.url(event) : "";
    
    try {
      const reply = await gpt(ask, url, senderID, "gpt-4o-mini");
      await api.sendMessage(reply, event.chatID, event.messageID).then((info) => {
        global.onReply.set(info.messageID, {
          cmdName
        })
      });
      
    } catch (e) {
     throw e;
    }
  },
  
  reply: async function ({ api, event, cmdName }) {
    const ask = event.body;
    const url = event.messageReply?.hasMedia ? await api.getMedia.url(event) : event.hasMedia ? await api.getMedia.url(event) : "";
    try {
      const reply = await gpt(ask, url, event.senderID, "gpt-4o-mini");
      await api.sendMessage(reply, event.chatID, event.messageID).then((info) => {
        global.onReply.set(info.messageID, {
          cmdName
        })
      });
    
    } catch (e) {
      throw e;
    }
  },

  chat: async function ({ api, event }) {
    const ask = event.body;
    const senderID = event.senderID;
    const url = event.messageReply?.hasMedia ? await api.getMedia.url(event) : event.hasMedia ? await api.getMedia.url(event) : "";

    if (ask?.toLowerCase() === "gpt on") {
      this.activeUsers.add(senderID);
      return api.sendMessage("✅ | GPT auto-reply has been enabled for you.", event.chatID, event.messageID);
    }

    if (ask?.toLowerCase() === "gpt off") {
      this.activeUsers.delete(senderID);
      return api.sendMessage("❎ | GPT auto-reply has been disabled for you.", event.chatID, event.messageID);
    }

    if (!this.activeUsers.has(senderID)) return;
    if (!ask || ask.length === 0) return;

    try {
      await api.sendMessage("✍️ | Thinking...", event.threadID);
      const reply = await gpt(ask, url, senderID, "gpt-4o-mini");
      
      await api.sendMessage(reply, event.chatID, event.messageID);
    } catch (error) {
      throw error;
    }
  }
};
