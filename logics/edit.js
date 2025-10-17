module.exports = {
  config: {
    name: "edit",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Edit image using AI",
    category: "AI",
    guide: "/edit add a cat (with image)\n/edit add a cat (reply to an image)"
  },
  logic: async ({ api, event, args }) => {
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
      const media = await api.edit(url, prompt);
      await api.sendMessage({ attachment: media, body: "ಠಿ⁠_⁠ಠಿ Edited...!!" }, event.senderID, event.messageID);
    } catch (e) {
      throw e;
    }
  }
};
