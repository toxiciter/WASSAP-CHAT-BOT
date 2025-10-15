module.exports = {
  config: {
    name: "wl",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "grant permission to use bot",
    category: "owner",
    guide: "Usage: /wl [add | -a] <uid> or reply a message\n/wl [remove | -r] <uid>\n/wl [list | -l]"
  },
  logic: async ({ wl, event, api, args }) => {
    const uid = event.message_reply ? event.messageReply.from : args[1];
    switch (args[0]) {
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
        return await wl.list();
      }
        

      default:
        return event.reply("Usage: /wl [add | -a] <uid> or reply a message\n/wl [remove | -r] <uid>\n/wl [list | -l]");
    }
  }
};
