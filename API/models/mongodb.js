const mongoose = require("mongoose");


const mapSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
});

const MapModel = mongoose.model("MapModel", mapSchema);

module.exports = {
  async set(key, value) {
    await MapModel.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
  },

  async get(key) {
    const data = await MapModel.findOne({ key });
    return data ? data.value : undefined;
  },

  async has(key) {
    return !!(await MapModel.exists({ key }));
  },

  async delete(key) {
    await MapModel.deleteOne({ key });
  },

  async clear() {
    await MapModel.deleteMany({});
  },

  async entries() {
    const docs = await MapModel.find({});
    return docs.map((doc) => [doc.key, doc.value]);
  },
};
