const mongoose = require("mongoose");

const whitelistSchema = new mongoose.Schema({
  whitelisted: { type: [String], default: [] }
});

module.exports = mongoose.model("Whitelist", whitelistSchema);
