const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "😒",
    version: "1.0",
    author: "Tumi",
    countDown: 0,
    role: 0,
    shortDescription: "Send voice only",
    category: "noPrefix",
    guide: "😒"
  },

  onStart: async function () {
    const url = "https://drive.google.com/uc?export=download&id=12B4Fjs11jZQpN1Kh7Gd7msICGwGKTZFq";
    const dest = path.join(__dirname, "rahad_voice.mp4");
    if (!fs.existsSync(dest)) {
      const res = await axios({ url, method: "GET", responseType: "stream" });
      res.data.pipe(fs.createWriteStream(dest));
      await new Promise(resolve => res.data.on("end", resolve));
      console.log("✅ Voice downloaded from Drive");
    }
  },

  onChat: async function ({ event, api }) {
    if (event.body === "😒" && !event.attachments?.length) {
      const voicePath = path.join(__dirname, "rahad_voice.mp4");
      if (fs.existsSync(voicePath)) {
        return api.sendMessage({ attachment: fs.createReadStream(voicePath) }, event.threadID, event.messageID);
      }
    }
  }
};
