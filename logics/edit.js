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
      const url = event.messageReply.hasMedia ? await api.getMediaUrl(event) : event.hasMedia ? await api.getMediaUrl(event) : event.reply("Please provide an image to editing");
      const media = await api.edit(url, prompt);
      await api.sendMessage({ attachment: media, body: "ಠಿ⁠_⁠ಠಿ Edited...!!" }, event.senderID, event.messageID);
    } catch (e) {
      throw new Error(e.message);
    }
  }
};
