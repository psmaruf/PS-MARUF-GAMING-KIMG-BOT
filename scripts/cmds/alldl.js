const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "i",
    aliases: ["video", "download"],
    version: "1.0",
    author: "FATHER RAHAD",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Download and send video" },
    longDescription: { en: "Download any video via URL and send with glitch style" },
    category: "media",
    guide: { en: "{pn} <video url>" }
  },

  onStart: async function ({ api, event, args }) {
    const url = args[0];
    if (!url) return api.sendMessage("❌ Please provide a valid video URL!", event.threadID, event.messageID);

    try {
      const res = await axios.get(url, { responseType: "stream" });
      const ext = path.extname(url.split("?")[0]);
      const filePath = path.join(__dirname, "cache", `video${ext}`);

      const writer = fs.createWriteStream(filePath);
      res.data.pipe(writer);
      writer.on("finish", async () => {
        const shortUrl = url.length > 45 ? url.slice(0, 45) + "..." : url;

        const bodyText = `
┌═════════════⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺═════════════┐
   ⚠️ [𝐄𝐗𝐓𝐑𝐄𝐌𝐄 𝐀𝐋𝐄𝐑𝐓] ⚠️ 
        𝗛𝗢𝗟𝗬 𝗙𝗜𝗟𝗘 𝗘𝗡𝗖𝗢𝗨𝗡𝗧𝗘𝗥𝗘𝗗
└═════════════⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺⩺═════════════┘

🧬 𝙁𝙄𝙇𝙀 𝙄𝘿: ${shortUrl}
🎬 𝗣𝗥𝗢𝗝𝗘𝗖𝗧: 𝙍𝘼𝙃𝘼𝘿_𝙊𝙋_𝙀𝙓𝙀_𝟜𝟶𝟰
👽 𝗔𝗨𝗧𝗛𝗢𝗥𝗜𝗭𝗘𝗗 𝗕𝗬: 👑 𝗙𝗔𝗧𝗛𝗘𝗥 𝗥𝗔𝗛𝗔𝗗™

📡 STATUS: 𝗨𝗣𝗟𝗜𝗡𝗞 𝗘𝗦𝗧𝗔𝗕𝗟𝗜𝗦𝗛𝗘𝗗
🔗 FILE READY FOR: 🌀 𝗧𝗘𝗥𝗠𝗜𝗡𝗔𝗟 𝗗𝗘𝗖𝗢𝗗𝗘

┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 💻 SYSTEM CORE ACTIVATED...          ┃
┃ 👾 GLITCHED BOT MASTER ONLINE    ┃
┃ 🎯 LAUNCH BY: 𝗥𝗔𝗛𝗔𝗗.𝗕𝗢𝗧          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

📎 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗: ${shortUrl}
🔰 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗘𝗗 𝗕𝗬: 𝘼𝙄-𝙎𝙃𝙄𝙀𝙇𝘿𝙓
🌌 𝗧𝗛𝗘𝗠𝗘: ☠️ "𝗡𝗢 𝗛𝗨𝗠𝗔𝗡, 𝗢𝗡𝗟𝗬 𝗖𝗢𝗥𝗘"
        `;

        api.sendMessage({
          body: bodyText,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to download video. Try a valid direct URL.", event.threadID, event.messageID);
    }
  }
};
