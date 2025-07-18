const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "intro",
    version: "2.2",
    author: "Rahad Team x Bayjid",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Intro with attached video" },
    longDescription: { en: "Show stylish bot & owner intro with Google Drive video" },
    category: "🧠 Info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {
    const botName = global.GoatBot.config.botName || "Rahad Bot";
    const ownerName = global.GoatBot.config.author || "BaYjid";
    const prefix = global.GoatBot.config.prefix || ".";
    const version = this.config.version;
    const ownerUID = "61572930974640";
    const fbProfile = "https://fb.com/100094536263296";

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const timeNow = moment.tz("Asia/Dhaka").format("hh:mm:ss A - DD/MM/YYYY");

    const introText = `
╔═════ 💠 ${botName.toUpperCase()} 💠 ═════╗
║ 👑 Owner: ${ownerName}
║ 🔗 FB: ${fbProfile}
║ 🆔 UID: ${ownerUID}
║ 💾 Version: ${version}
║ ⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s
║ 🕐 Time: ${timeNow}
║ ⌨️ Prefix: ${prefix}
║ 🧠 Status: ACTIVE ✅
║ 🧑‍💻 Powered By: RAHAD TEAM ⚡
╚══════════════════════════════╝

🎥 Attached: Bot Intro Video 🎬
    `.trim();

    const videoUrl = "https://drive.google.com/uc?export=download&id=12DuB966likJ_pjKGtjAtPQMmK0eP2QW3";
    const videoPath = path.join(__dirname, "intro.mp4");

    try {
      const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(videoPath, Buffer.from(res.data, "binary"));

      message.reply({
        body: introText,
        attachment: fs.createReadStream(videoPath)
      }, () => fs.unlinkSync(videoPath)); // delete video after sending
    } catch (err) {
      console.error("Video fetch failed:", err);
      message.reply(introText);
    }
  }
};
