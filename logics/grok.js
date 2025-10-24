module.exports = {
  config: {
    name: "grok",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "grok AI which can generate picture and reply response on your message",
    category: "AI",
    guide: "{pn} hie\n{pn} generate a picture of a girl"
  },
  logic: async ({ api, event, args, cmdName }) => {
    try {
      const text = args.length ? args.join(" ") : "hie";
      const uid = event.senderID;
      const data = await api.grok(text, uid);
      let msg;
      if (data && data.images && data.images.length >0) {
        msg = await api.sendMessage({ attachment: data.images, body: data.response }, event.chatID, event.messageID);
      } else {
        msg = await api.sendMessage(data.response, event.chatID, event.messageID);
      };
      await global.onReply.set(msg.messageID, {
        author: uid,
        cmdName
      });
      
    } catch (e) {
      throw e;
    }
  },
  reply: async ({ api, event, cmdName, Reply }) => {
    const { author } = Reply;
    if (author !== event.senderID) return;
    try {
      const text = event.body;
      const uid = event.senderID;
      const data = await api.grok(text, uid);
      let msg;
      if (data && data.images && data.images.length >0) {
        msg = await api.sendMessage({ attachment: data.images, body: data.response }, event.chatID, event.messageID);
      } else {
        msg = await api.sendMessage(data.response, event.chatID, event.messageID);
      };
      await global.onReply.set(msg.messageID, {
        author: uid,
        cmdName
      });
    } catch (e) {
      throw e;
    }
  }
};
