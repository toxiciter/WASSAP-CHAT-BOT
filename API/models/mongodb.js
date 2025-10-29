const mongoose = require("mongoose");
const methods = require("./helper.js");


const linkSchema = new mongoose.Schema({
  category: String,
  link: String
});
methods(linkSchema);
const Link = mongoose.model('Link', linkSchema);


const MessageSchema = new mongoose.Schema({
  role: String,
  content: String
});
const ToxicHistorySchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  messages: [MessageSchema]
});
methods(ToxicHistorySchema);
const toxicHistory = mongoose.model("toxicHistory", ToxicHistorySchema);


const whitelistSchema = new mongoose.Schema({
  whitelisted: { type: [String], default: ["8801843152929@c.us", "229978922856551@lid"] }
});
methods(whitelistSchema);
const whiteList = mongoose.model("whiteList", whitelistSchema);


module.exports = {
  Link,
  toxicHistory,
  whiteList
};
