module.exports = {
  config: {
    name: "art",
    version: "1.0",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "You can use many photo edit filter like ghibli , cyberpunk , anime .etc",
    category: "AI",
    guide: "{pn} <type> (with an image)"
  },
  logic: async ({ args, api, event }) => {
    const url = event.message_reply && event.messageReply.hasMedia ? await api.getMedia.url(event) : event.hasMedia ? await api.getMedia.url(event) : event.reply("please provide an image...!");
    const type = args[0] || "anime";
    
    const validType = ["anime", "ghibli", "cyberpunk", "comic", "anime_2", "anime_3", "ultra", "draw"];
    if(!validType.includes(type)) {
      return api.sendMessage("⛔ | Invalid type! Available type: " + validType.join(", "), event.chatID, event.messageID);
    }
    
    
    try {
      const wait = api.sendMessage("✨ | Filtering your image. . .", event.chatID, event.messageID);
      const image = await api.art(url, type);
      
      await api.sendMessage({ 
        body: "Here's your Filtered image <😽>",
        attachment: image 
      }, event.chatID, event.messageID);
    } catch (e) {
      throw e
    }
  }
}
