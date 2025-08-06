const fs = require("fs");
const { URL } = require("url");

function dataType(input) {
  // Check if it's a valid URL
  try {
    new URL(input);
    return "url";
  } catch (err) {}

  // Check if it's an existing file path
  if (fs.existsSync(input)) {
    return "file";
  }

  return "unknown";
}

module.exports = {
  dataType
};
