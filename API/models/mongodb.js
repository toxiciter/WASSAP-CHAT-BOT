const mongoose = require("mongoose");
const methods = require("./helper.js");


const onReplySchema = new mongoose.Schema({
  messageID: String,
  data: Object
});
methods(onReplySchema);
const onReply = mongoose.model("onReply", onReplySchema);


const linkSchema = new mongoose.Schema({
  category: String,
  link: String
});
methods(linkSchema);
const links = mongoose.model('links', linkSchema);


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


module.exports = {
  onReply,
  links,
  toxicHistory
};
