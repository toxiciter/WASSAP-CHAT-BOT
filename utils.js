const fs = require("fs");
const { URL } = require("url");

function dataType(input) {
  try {
    new URL(input);
    return "url";
  } catch (err) {}
  
  if (fs.existsSync(input)) {
    return "file";
  }

  return "unknown";
}

module.exports = {
  dataType
};