const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

let talkedRecently = new Set();

module.exports = {
  config: {
    name: "emaaudio",
    version: "1.1",
    author: "Rahad",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send voice on specific emoji/text",
    },
    longDescription: {
      en: "Replies with voice and message when user sends certain emoji or 'i love you'",
    },
    category: "fun",
  },

  onStart: async function () {},

  onChat: async function ({ event, api }) {
    const triggers = {
      "😀": {
        url: "https://drive.google.com/uc?export=download&id=13Jr2kZeMHOaVwsrX-FGBkwHmnOK3YkLm",
        message: `
🌸💔 𝗜 𝗧𝗿𝗶𝗲𝗱... 
𝗜 𝗣𝗿𝗼𝗺𝗶𝘀𝗲𝗱... 
𝗜 𝗟𝗼𝘃𝗲𝗱... 
𝗕𝘂𝘁 𝗜 𝗚𝗼𝘁 𝗧𝗶𝗿𝗲𝗱... 🖤`
      },
      "🥺": {
        url: "https://drive.google.com/uc?export=download&id=13NVp3r8BhnfAGbe6eLLQaOhPWvnHRKqe",
        message: `
🖤 Sometimes the person who tries to keep everyone happy is the most lonely person 💔`
      },
      "🥲": {
        url: "https://drive.google.com/uc?export=download&id=13CWeUhyeyX6Yd-AX9IxWuCmkN8u8IDQL",
        message: `
💔 I'm not mad...
I'm just hurt...
There's a difference... 🥀`
      },
      "i love you": {
        url: "https://drive.google.com/uc?export=download&id=13NVp3r8BhnfAGbe6eLLQaOhPWvnHRKqe",
        message: `
💘 You said "I love you"... 
But did you mean it? 💔`
      }
    };

    const msg = event.body?.toLowerCase()?.trim();
    if (!msg) return;

    if (talkedRecently.has(event.senderID)) return;

    for (let key in triggers) {
      if (msg === key.toLowerCase()) {
        try {
          talkedRecently.add(event.senderID);
          setTimeout(() => talkedRecently.delete(event.senderID), 10 * 1000);

          const { url, message } = triggers[key];
          const res = await axios.get(url, { responseType: "arraybuffer" });
          const filePath = path.join(__dirname, "temp_audio.mp3");
          fs.writeFileSync(filePath, res.data);

          await api.sendMessage(
            {
              body: message,
              attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => fs.unlinkSync(filePath),
            event.messageID
          );
        } catch (err) {
          console.error("Voice send error:", err);
        }
        break;
      }
    }
  }
};
