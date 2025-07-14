module.exports = {
  config: {
    name: "🙂",
    version: "1.3",
    author: "Bayjid x ChatGPT",
    countDown: 0,
    role: 0,
    shortDescription: "🙂 emoji dile stylish video message",
    longDescription: "Reply with styled text + random video",
    category: "no prefix",
    guide: "Send 🙂"
  },

  onStart: async function () {
    // Empty function to fix load error
  },

  onChat: async function ({ message, event }) {
    if (event.body !== "🙂") return;

    const videos = [
      { id: "10yxHLNf-xHdUwe7DIREwNjYuv7QnlZhg", fileName: "smile1.mp4" },
      { id: "10zMRj7YzXh-sR2aXqay0LvWG0c9-GPG9", fileName: "smile2.mp4" }
    ];
    const chosen = videos[Math.floor(Math.random() * videos.length)];
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, chosen.fileName);

    await fs.ensureDir(cacheDir);

    if (!fs.existsSync(filePath)) {
      try {
        const url = `https://drive.google.com/uc?export=download&id=${chosen.id}`;
        const response = await axios({ method: "GET", url, responseType: "stream" });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      } catch (err) {
        console.error("Download error:", err);
        return message.reply("❌ Video download fail hoise boss.");
      }
    }

    const bodyText = "🌟 𝗞𝗜𝗥𝗘 𝗣𝗔𝗚𝗢𝗟?\n𝗔𝗠𝗥 𝗕𝗢𝗦𝗦 𝗥𝗔𝗛𝗔𝗗 𝗞𝗢𝗜 🤗";

    return message.reply({
      body: bodyText,
      attachment: fs.createReadStream(filePath)
    });
  }
};
