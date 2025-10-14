const mongoose = require("mongoose");

const whitelistSchema = new mongoose.Schema({
  whitelisted: { type: [String], default: ["8801843152929@c.us"] }
});

module.exports = mongoose.model("Whitelist", whitelistSchema);
