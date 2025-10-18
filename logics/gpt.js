const axios = require("axios");

module.exports = {
  config: {
    name: "gpt",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "For conversation with real chatGPT",
    category: "AI",
    guide: "{pn} [your message]\n{pn} [your message] (with an image)\n{pn} [your message] (With reply of an image)\nexample: {pn} hey ki koro"
  },

  logic: async ({ api, args, event, cmdName }) => {
    const prompt = args.join(" ") || "hie";
    try {
    let url = "";
      if (event.message_reply && event.messageReply.hasMedia) {
        url = await api.getMedia.url(event);
      } else if (event.hasMedia) {
        url = await api.getMedia.url(event);
      };
    const { data } = await axios.get(
      `https://www.noobx.ct.ws/api/gpt-pro?uid=${event.from}&text=${encodeURIComponent(prompt)}&imageUrl=${url}`
    );

    const msg = await api.sendMessage(data.response, event.chatID, event.messageID);

    global.onReply.set(msg.id._serialized, {
      cmdName,
      author: event.senderID
    });
    } catch (e) {
      throw e;
    }
  },

  reply: async ({ api, event, cmdName }) => {
    try {
    const prompt = event.body;
    let url = "";
      if (event.message_reply && event.messageReply.hasMedia) {
        url = await api.getMedia.url(event);
      } else if (event.hasMedia) {
        url = await api.getMedia.url(event);
      };
    const { data } = await axios.get(
      `https://www.noobx.ct.ws/api/gpt-pro?uid=${event.from}&text=${encodeURIComponent(prompt)}&imageUrl=${url}`
    );

    const msg = await api.sendMessage(data.response, event.chatID, event.messageID);

    global.onReply.set(msg.id._serialized, {
      cmdName,
      author: event.senderID
    });
    } catch (e) {
      throw e;
    }
  }
};
