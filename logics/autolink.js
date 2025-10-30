module.exports = {
  config: {
    name: "autolink",
    version: "1.1",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Direct auto downloader with platform detection",
    category: "media",
  },

  logic: async function () {},
  chat: async function ({ api, event }) {
    const url = event.body?.trim();

    const platforms = {
      "https://www.tiktok.com": "TikTok",
      "https://vm.tiktok.com": "TikTok",
      "https://vt.tiktok.com": "TikTok",
      "https://www.facebook.com": "Facebook",
      "https://fb.watch": "Facebook",
      "https://www.instagram.com": "Instagram",
      "https://youtu.be/": "YouTube",
      "https://youtube.com": "YouTube",
      "https://x.com": "Twitter (X)",
      "https://twitter.com": "Twitter",
      "https://pin.it/": "Pinterest",
    };

    const matched = Object.keys(platforms).find(domain => url?.startsWith(domain));
    if (!matched) return;

    const platformName = platforms[matched];

    try {
      await event.react("⏳");
      const media = await api.alldl(url, "b");
      await event.react("✅");

      await api.sendMessage({
        body: `✨ | Successfully Download The Video...!!\n🔖 Platform: ${platformName}`,
        attachment: media
      }, event.chatID, event.messageID);
    } catch (e) {
      console.error(e);
      await event.react("❌");
    }
  }
};
