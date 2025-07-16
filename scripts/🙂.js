
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "🙂",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Bayjid",
  description: "Send voice when command or ðŸ™‚ is sent",
  commandCategory: "fun",
  usages: "",
  cooldowns: 3,
};

const cachePath = path.join(__dirname, "caches", "autovoice.mp3");
const downloadUrl = "https://drive.google.com/uc?export=download&id=13OZg_BRv8THc9PMLZ92z4DJ7W_63mFzg";

async function ensureVoiceFile() {
  if (!fs.existsSync(cachePath)) {
    const res = await axios.get(downloadUrl, { responseType: "stream" });
    await new Promise((resolve, reject) => {
      const stream = res.data.pipe(fs.createWriteStream(cachePath));
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  }
}

module.exports.run = async ({ api, event }) => {
  await ensureVoiceFile();
  return api.sendMessage(
    {
      body: "ðŸŽ¤ Auto Voice Activated!",
      attachment: fs.createReadStream(cachePath),
    },
    event.threadID,
    event.messageID
  );
};

// Trigger on emoji (no prefix)
module.exports.handleEvent = async ({ api, event }) => {
  if (event.body && event.body.trim() === "ðŸ™‚") {
    await ensureVoiceFile();
    return api.sendMessage(
      {
        body: "ðŸŽ¤ Auto Voice Activated!",
        attachment: fs.createReadStream(cachePath),
      },
      event.threadID,
      event.messageID
    );
  }
};
