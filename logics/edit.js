const axios = require("axios");

module.exports = {
  config: {
    name: "edit",
    author: "",
    description: "",
    category: "",
    guide: ""
  },
  logic: async ({ api, event, args }) => {
    const p = args.join(" ") || "explain";
    if (event.hasMedia) {
     const url = await api.getMediaUrl(event);
    } else {
      event.reply("please provide an image with what kind of edit you want explain...!")
    }
    const { data } = await axios.get(`https://www.noobx.ct.ws/api/edit?url=${url}&prompt=${encodeURIComponent(p)}`);
    await api.sendMessage({ attachment: data.url, body: data.response }, event.from, event.id._serialized);
  }
};
