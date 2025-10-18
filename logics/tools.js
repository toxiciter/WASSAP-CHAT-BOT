module.exports = {
  config: {
    name: "tools",
    version: "1.1",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "You can use many photo edit tools like upscale, background remove, background replace, edit with prompt etc.",
    category: "tools",
    guide: "{pn} -t <type> <prompt> (prompt is optional for some types like edit, replacebg)"
  },

  logic: async ({ args, api, event }) => {
    let url;
      if (event.message_reply && event.messageReply.hasMedia) {
        url = await api.getMedia.url(event);
      } else if (event.hasMedia) {
        url = await api.getMedia.url(event);
      } else {
        return event.reply("Please provide an image...!!");
      }
    
    let type = "edit";
    let prompt = args.join(" ");
    const match = prompt.match(/(.*?)-t\s+(\w+)/);

    if (match) {
      prompt = match[1].trim();
      type = match[2].trim();
    }

    const validTypes = ["upscale", "undress", "removebg", "changebg", "blurbg", "edit", "draw", "art", "upscale_2", "logo", "undresspro", "gta", "expend", "swap", "naked"];
    if (!validTypes.includes(type)) {
      return api.sendMessage(`❌ | Invalid type "${type}". Valid types are: ${validTypes.map(e => `\`${e}\``).join(", ")}`, event.chatID, event.messageID);
    }

    /*if ((type === "undress" || type === "undresspro" || type === "naked") && await check() !== true) {
      return api.sendMessage("🚫 | Sorry, only bot owner can use this sensitive feature.", event.threadID, event.messageID);
    }*/

    /*if (type === "swap") {
      if (!attachments[1]) {
        return api.sendMessage("❌ | Please reply to a message with two images to swap.", event.threadID, event.messageID);
      }
      const w = await api.sendMessage("🔁 | Swapping your image...!!", event.threadID, event.messageID);
      const swapFrom = attachments[0].url;
      const swapTo = attachments[1].url;
      const swapType = args[2] || "face";

      try {
        const image = await swap(swapFrom, swapTo, swapType);
        const stream = await global.utils.getStreamFromURL(image);
        await api.unsendMessage(w.messageID);
        return api.sendMessage({ body: "🔁 | Here's your swapped image!", attachment: stream }, event.threadID, event.messageID);
      } catch (e) {
        return api.sendMessage("❌ | Failed to swap images\nDetails: " + e.message, event.threadID, event.messageID);
      }
    }*/

    try {
      const waitMsg = await api.sendMessage("✨ | Processing your image. Please wait...", event.chatID, event.messageID);
      const image = await api.tools(url, type, prompt);
      //await api.unsendMessage(waitMsg.messageID);
      await api.sendMessage({ body: "🎉 | Here's your processed image!", attachment: image }, event.chatID, event.messageID);
    } catch (e) {
      throw e;
    }
  }
};
