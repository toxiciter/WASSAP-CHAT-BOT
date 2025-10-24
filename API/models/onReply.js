const mongoose = require("mongoose");

const onReplySchema = new mongoose.Schema({
  messageID: String,
  data: Object
});

module.exports = mongoose.model("onReply", onReplySchema);
