const { MessageMedia } = require("whatsapp-web.js");
const { dataType } = require("./utils.js");

module.exports = (event, client) => {
  return async (msg, chatID, messageID) => {
    try {
      
      if (!(typeof chatID === "string" || Array.isArray(chatID))) {
        throw new Error("chatID must be a string or an array of IDs");
      }

      
      if (typeof msg === "object" && msg !== null) {
        const { body = "", attachment } = msg;

        if (!attachment) {
          
          if (Array.isArray(chatID)) {
            return await Promise.all(chatID.map(id => send({ body }, id, messageID)));
          } else {
            return await send({ body }, chatID, messageID);
          }
        };

        
        if (Array.isArray(attachment)) {
          await Promise.all(
            attachment.map(async (file) => {
              const isUrl = dataType(file) === "url";
              const media = isUrl
                ? await MessageMedia.fromUrl(file)
                : await MessageMedia.fromFilePath(file);

              if (Array.isArray(chatID)) {
                return await Promise.all(
                  chatID.map(id =>
                    send({ media, body }, id, messageID)
                  )
                );
              } else {
                return await send({ media, body }, chatID, messageID);
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
            return await Promise.all(
              chatID.map(id =>
                send({ media, body }, id, messageID)
              )
            );
          } else {
            return await send({ media, body }, chatID, messageID);
          }
        }
      } 

      else if (typeof msg === "string") {
        if (Array.isArray(chatID)) {
          return await Promise.all(chatID.map(id => send({ body: msg }, id, messageID)));
        } else {
          return await send({ body: msg }, chatID, messageID);
        }
      }

      async function send(content = {}, id, reply = "") {
        const { media, body = "" } = content;
        const finalContent = media ? media : body;
        const caption = media ? body : "";
        
        const msg = await client.sendMessage(id, finalContent, {
          caption: caption,
          quotedMessageId: reply
        });
        
        const cMsg = Object.assign(msg, {
          senderID: msg.from,
          chatID: msg._getChatId(),
          messageID: msg.id._serialized
        });
        
        return cMsg;
      };

    } catch (err) {
      throw err;;
    }
  };
};
