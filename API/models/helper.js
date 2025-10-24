module.exports = (schema) => {
  schema.statics.set = async function (data) {
    if (typeof data !== "object" || Array.isArray(data))
      throw new Error("Argument must be an object");

    const newData = new this(data);
    return await newData.save();
  };

  schema.statics.get = async function (query) {
    if (typeof query !== "object" || Array.isArray(query))
      throw new Error("Argument must be an object");

    return await this.find(query);
  };

  schema.statics.delete = async function (query) {
    if (typeof query !== "object" || Array.isArray(query))
      throw new Error("Argument must be an object");

    return await this.deleteMany(query);
  };
};
