const fs = require("fs");
const { URL } = require("url");
const path = require("path");

function dataType(input) {
  try {
    new URL(input);
    return "url";
  } catch (err) {}
  
  if (fs.existsSync(input)) {
    return "file";
  }

  return "unknown";
};

async function getMediaUrl(event) {
  try {
  const media = await event.downloadMedia();
  const fileName = "file_" + Date.now() + ".jpg";
  const imagePath = path.join(__dirname, "public", fileName);
  fs.writeFileSync(imagePath, media.data, { encoding: "base64" });
  return "https://wassap-chat-bot.onrender.com/" + fileName;
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {
  dataType,
  getMediaUrl
};
