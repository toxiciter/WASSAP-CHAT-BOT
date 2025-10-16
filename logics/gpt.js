const axios = require("axios");

module.exports = {
  config: {
    name: "gpt",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "For conversation with real chatGPT",
    category: "AI",
    guide: "/gpt [YOUR MESSAGE]\n/gpt [YOUR MESSAGE] (with an image)\nexample: /gpt hey ki koro"
  },

  logic: async ({ api, args, event, cmdName }) => {
    const prompt = args.join(" ") || "hie";
    try {
    let url = "";
      if (event.message_reply && event.messageReply.hasMedia) {
        url = await api.getMediaUrl(event);
      } else if (event.hasMedia) {
        url = await api.getMediaUrl(event);
      };
    const { data } = await axios.get(
      `https://www.noobx.ct.ws/api/gpt-pro?uid=${event.from}&text=${encodeURIComponent(prompt)}&imageUrl=${url}`
    );

    const msg = await api.sendMessage(data.response, event.senderID, event.messageID);

    global.onReply.set(msg.messageID, {
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
        url = await api.getMediaUrl(event);
      } else if (event.hasMedia) {
        url = await api.getMediaUrl(event);
      };
    const { data } = await axios.get(
      `https://www.noobx.ct.ws/api/gpt-pro?uid=${event.from}&text=${encodeURIComponent(prompt)}&imageUrl=${url}`
    );

    const msg = await api.sendMessage(data.response, event.senderID, event.messageID);

    global.onReply.set(msg.messageID, {
      cmdName,
      author: event.senderID
    });
    } catch (e) {
      throw e;
    }
  }
};
