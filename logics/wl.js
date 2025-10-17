module.exports = {
  config: {
    name: "wl",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Grant permission to use bot",
    category: "owner",
    guide: "{pn} [add | -a] <uid> or reply to a message of that user\n{pn} [remove | -r] <uid> or or reply to a message of that user\n{pn} [list | -l]"
  },
  logic: async ({ wl, event, info, json, args }) => {
    const uid = event.message_reply ? event.messageReply.from : args[1];
    switch (args[0]) {
      case "on": {
        await json.edit("whiteListMode", true);
        event.reply("✅ Turn on only whitelisted user's can use bot..!")
      }

      case "off": {
        await json.edit("whiteListMode", false);
        event.reply("⚠️ Turn off only whitelisted user's can use bot..!");
      }
        
      case "add":
      case "-a": {
        await wl.add(uid);
        return event.reply(`✅ ${uid} added to whitelist`);
      }

      case "remove":
      case "-r": {
        await wl.remove(uid);
        return event.reply(`❌ ${uid} removed from whitelist`);
      }
      case "list":
      case "-l": {
        const list = await wl.list();
        return event.reply(`WHITELIST USER\nlist.join("\n")`);
      }
        

      default:
        return event.reply("Usage: /wl [add | -a] <uid> or reply a message\n/wl [remove | -r] <uid>\n/wl [list | -l]");
    }
  }
};
