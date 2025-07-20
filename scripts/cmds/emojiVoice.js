const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "emojiVoice",
    version: "1.5",
    author: "Father Rahad",
    role: 0,
    shortDescription: {
      en: "Breakup voice when 'i love you' is detected"
    },
    longDescription: {
      en: "Trigger sad breakup voice when someone says 'i love you'"
    },
    category: "auto",
    guide: {
      en: "Type 'i love you' to trigger a sad voice."
    }
  },

  onStart: async function () {},

  onChat: async function ({ message, event }) {
    try {
      const msgBody = (event.body || "").toLowerCase();

      if (msgBody.includes("i love you")) {
        const voiceUrl = "https://drive.google.com/uc?export=download&id=13NVp3r8BhnfAGbe6eLLQaOhPWvnHRKqe";

        const response = await axios.get(voiceUrl, {
          responseType: "arraybuffer"
        });

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        const filePath = path.join(cacheDir, `emojiVoice_${event.messageID}.mp3`);
        fs.writeFileSync(filePath, response.data);

        await message.reply({
          body: `╭───💔 𝗟𝗢𝗩𝗘 𝗙𝗔𝗗𝗘𝗦 𝗔𝗪𝗔𝗬 ───╮\n"I love you"... but it's too late now.\n🎧 Listen to the final voice that remains...\n╰─────────────────────────────╯`,
          attachment: fs.createReadStream(filePath)
        });

        setTimeout(() => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 60 * 1000);
      }

    } catch (err) {
      console.error("EmojiVoice Error:", err);
    }
  }
};
