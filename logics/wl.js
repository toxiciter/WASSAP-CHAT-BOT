module.exports = {
  config: {
    name: "wl",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Grant permission to use bot",
    category: "owner",
    guide: "{pn} [add | -a] <uid> or reply to a message of that user\n{pn} [remove | -r] <uid> or or reply to a message of that user\n{pn} [list | -l]"
  },
  logic: async ({ wl, event, args, client }) => {
    const uid = event.message_reply ? event.messageReply.senderID : args[1];
    const contact = await client.getContactById(uid);
    switch (args[0]) {  
      case "add":
      case "-a": {
        await wl.add(uid);
        return event.reply(`✅ Successfully added ${contact.pushname} to whitelist`);
      }

      case "remove":
      case "-r": {
        await wl.remove(uid);
        return event.reply(`❌ Removed ${contact.pushname} from whitelist`);
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
