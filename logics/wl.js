module.exports = {
  config: {
    name: "wl",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "grant permission to use bot",
    category: "owner",
    guide: "Usage: /wl [add | -a] <uid> or reply a message\n/wl [remove | -r] <uid>"
  },
  logic: async ({ wlAdd, wlRemove, event, api, args }) => {
    const uid = event.message_reply ? event.messageReply.from : args[1];
    switch (args[0]) {
      case "add":
      case "-a": {
        await wlAdd(uid);
        return event.reply(`✅ ${uid} added to whitelist`);
      }

      case "remove":
      case "-r": {
        await wlRemove(uid);
        return event.reply(`❌ ${uid} removed from whitelist`);
      }

      default:
        return event.reply("Usage: /wl [add | -a] <uid> or reply a message\n/wl [remove | -r] <uid>");
    }
  }
};
