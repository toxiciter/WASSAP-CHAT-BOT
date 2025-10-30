module.exports = {
  config: {
    name: "wl",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Grant permission to use bot",
    category: "owner",
    guide: "{pn} [add | -a] <uid> or reply to a message of that user\n{pn} [remove | -r] <uid> or or reply to a message of that user\n{pn} [list | -l]"
  },
  logic: async ({ wl, event, args, client }) => {
    const uid = event.message_reply ? event.messageReply.contact.id.serialized : args[1];
    const whitelisted = await wl.list();
    
    switch (args[0]) {  
      case "add":
      case "-a": {
        const contact = await client.getContactById(uid);
        if (!whitelisted.includes(uid)) {
        await wl.add(uid);
        return event.reply(`✅ Successfully added ${contact.pushname} to whitelist`);
        } else {
          return event.reply(`The user ${contact.pushname} already in whitelist`);
        }
      }

      case "remove":
      case "-r": {
        const contact = await client.getContactById(uid);
        if (whitelisted.includes(uid)) {
        await wl.remove(uid);
        return event.reply(`❌ Removed ${contact.pushname} from whitelist.`);
        } else {
          return event.reply(`${contact.pushname} was not in whitelist.`)
        }
      }
      case "list":
      case "-l": {
        let msg = "WHITELISTED USER\n\n";
        for (const id of whitelisted) {
          const name = (await client.getContactById(id)).pushname;
          msg += `• ${name}\n`
        }
        return event.reply(msg);
      }
        

      default:
        return event.reply("Usage: /wl [add | -a] <uid> or reply a message\n/wl [remove | -r] <uid>\n/wl [list | -l]");
    }
  }
};
