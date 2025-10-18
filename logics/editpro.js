module.exports = {
  config: {
    name: "editpro",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Edit image using AI",
    category: "AI",
    guide: "{pn} add a cat (with image)\n{pn} add a cat (with reply an image)"
  },
  logic: async ({ api, event, args, cmdName }) => {
    try {
      const prompt = args ? args.join(" ") : event.reply("please explain what kind of edit you want..?");
      let url;
      if (event.message_reply && event.messageReply.hasMedia) {
        url = await api.getMedia.url(event);
      } else if (event.hasMedia) {
        url = await api.getMedia.url(event);
      } else {
        return event.reply("Please provide an image to edit.");
      }
      const media = await api.editpro(url, prompt);
      await api.sendMessage({ attachment: media, body: "ಠಿ⁠_⁠ಠಿ Edited...!!" }, event.chatID, event.messageID)
        .then( async (info) => {
          global.onReply.set(info.id._serialized, {
            cmdName,
            author: event.senderID,
            url: await api.getMedia.url(info)
          })
        });
    } catch (e) {
      throw e;
    }
  },
  reply: async ({ Reply, event, api, cmdName }) => {
    try {
      const { url, author } = Reply;
      if(author !== event.senderID) return;
      const prompt = event.body;
      const media = await api.editpro(url, prompt);
      await api.sendMessage({ attachment: media, body: "ಠಿ⁠_⁠ಠಿ Edited...!!" }, event.chatID, event.messageID)
      .then( async (info) => {
        global.onReply.set(info.id._serialized, {
          cmdName,
          author: event.senderID,
          url: await api.getMedia.url(info)
        })
      });
    } catch (e) {
      throw e;
    }
  }
};
