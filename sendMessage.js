const { MessageMedia } = require("whatsapp-web.js");
const { dataType } = require("./utils.js");

module.exports = (event, client) => {
  return async (msg, chatID, messageReply) => {
    try {
      
      if (!(typeof chatID === "string" || Array.isArray(chatID))) {
        throw new Error("chatID must be a string or an array of IDs");
      }

      
      if (typeof msg === "object" && msg !== null) {
        const { body = "", attachment } = msg;

        if (!attachment) {
          
          if (Array.isArray(chatID)) {
            await Promise.all(chatID.map(id => client.sendMessage(id, body, { quotedMessageId: messageReply || "" })));
          } else {
            await client.sendMessage(chatID, body, { quotedMessageId: messageReply || "" });
          }
          return;
        }

        
        if (Array.isArray(attachment)) {
          await Promise.all(
            attachment.map(async (file) => {
              const isUrl = dataType(file) === "url";
              const media = isUrl
                ? await MessageMedia.fromUrl(file)
                : await MessageMedia.fromFilePath(file);

              if (Array.isArray(chatID)) {
                await Promise.all(
                  chatID.map(id =>
                    client.sendMessage(id, media, { caption: body, quotedMessageId: messageReply || "" })
                  )
                );
              } else {
                await client.sendMessage(chatID, media, { caption: body, quotedMessageId: messageReply || "" });
              }
            })
          );
        } 
        
        else {
          const isUrl = dataType(attachment) === "url";
          const media = isUrl
            ? await MessageMedia.fromUrl(attachment)
            : await MessageMedia.fromFilePath(attachment);

          if (Array.isArray(chatID)) {
            await Promise.all(
              chatID.map(id =>
                client.sendMessage(id, media, { caption: body, quotedMessageId: messageReply || "" })
              )
            );
          } else {
            await client.sendMessage(chatID, media, { caption: body, quotedMessageId: messageReply || "" });
          }
        }
      } 

      else if (typeof msg === "string") {
        if (Array.isArray(chatID)) {
          await Promise.all(chatID.map(id => client.sendMessage(id, msg, { quotedMessageId: messageReply || "" })));
        } else {
          await client.sendMessage(chatID, msg, { quotedMessageId: messageReply || "" });
        }
      }

    } catch (err) {
      console.error("❌ [sendMessage ERROR]:", err.message);
    }
  };
};
