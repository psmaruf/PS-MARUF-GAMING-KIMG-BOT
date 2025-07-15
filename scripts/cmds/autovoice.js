const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autovoice",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "ChatGPT + Bayjid",
  description: "Send voice when someone sends 😒 (no prefix)",
  commandCategory: "auto",
  usages: "Just send 😒 (without any prefix or text)",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ event, api }) {
  if (!event.body) return;
  const text = event.body.trim();

  // ✅ Trigger only when message is exactly 😒
  if (text === "😒") {
    const filePath = path.join(__dirname, "..", "cache", "autovoice", "voice1.mp3");
    if (fs.existsSync(filePath)) {
      return api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID);
    }
  }
};

module.exports.run = async () => {};