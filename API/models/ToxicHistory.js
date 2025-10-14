const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: String,
  content: String
});

const ToxicHistorySchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  messages: [MessageSchema]
});

module.exports = mongoose.model("ToxicHistory", ToxicHistorySchema);
