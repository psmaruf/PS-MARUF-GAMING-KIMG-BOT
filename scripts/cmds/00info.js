const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

// Function to apply deep-style Unicode transform
function toDeepStyle(text) {
  // Map normal characters to Mathematical Bold Italic Unicode (U+1D468 etc)
  // For simplicity, this function will only transform letters and digits to bold italic
  const boldItalicOffsetUpper = 0x1d468 - 65; // 'A' charCode = 65
  const boldItalicOffsetLower = 0x1d482 - 97; // 'a' charCode = 97
  const boldItalicDigits = [
    "𝟬", "𝟭", "𝟮", "𝟯", "𝟰",
    "𝟱", "𝟲", "𝟳", "𝟴", "𝟵"
  ];

  let result = "";

  for (const ch of text) {
    const code = ch.charCodeAt(0);

    if (code >= 65 && code <= 90) { // A-Z
      result += String.fromCodePoint(code + boldItalicOffsetUpper);
    } else if (code >= 97 && code <= 122) { // a-z
      result += String.fromCodePoint(code + boldItalicOffsetLower);
    } else if (code >= 48 && code <= 57) { // 0-9
      result += boldItalicDigits[code - 48];
    } else {
      result += ch; // keep other chars unchanged
    }
  }

  return result;
}

module.exports = {
  config: {
    name: "info",
    aliases: ["inf", "in", "Rahad", "owner"],
    version: "1.3",
    author: "Rahad",
    role: 0,
    shortDescription: { en: "Show bot & group info" },
    longDescription: { en: "Stylish HUD info with video 📽️" },
    category: "INFO",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, threadsData }) {
    try {
      const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY, hh:mm:ss A");

      const uptimeSeconds = process.uptime();
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

      const threadInfo = await threadsData.get(event.threadID);
      if (!threadInfo) return api.sendMessage("❌ Could not fetch thread info.", event.threadID);

      const members = threadInfo.members || [];

      const admins = members.filter(m => m.isAdmin || m.admin || m.role === "admin");
      const maleCount = members.filter(m => m.gender && m.gender.toLowerCase() === "male").length;
      const femaleCount = members.filter(m => m.gender && m.gender.toLowerCase() === "female").length;
      const totalMessages = threadInfo.totalMsg || 0;

      const ping = Date.now() - event.timestamp;

      // Compose message in normal text first
      const plainMsg = `
╔═━─━─━─━─━─━─━─━─━─━═╗
      ⚜️ RAHAD BOT ⚜️
╚═━─━─━─━─━─━─━─━─━─━═╝

👑 Owner  : Rahad
🛠 Mods   : Rahad
🌍 Location: Asia/Dhaka
🔋 Status : ⚡ Online

╭─━─━─━─━─━─━─━─━─━─━─╮
│ ⏰ Time    : ${time}
│ ⏳ Uptime  : ${uptimeStr}
│ ⚡ Ping    : ${ping}ms
╰─━─━─━─━─━─━─━─━─━─━─╯

╔─━─━─━─━─━─━─━─━─━─━─╗
      💬 GROUP INFO 💬
╚─━─━─━─━─━─━─━─━─━─━─╝

👥 Name     : ${threadInfo.threadName}
🆔 ID       : ${event.threadID}
👤 Members  : ${members.length} (♂ ${maleCount} / ♀ ${femaleCount})
🛡 Admins   : ${admins.length}
💬 Messages : ${totalMessages}
      `.trim();

      // Apply deep style unicode transform
      const body = toDeepStyle(plainMsg);

      // Video URL and path
      const videoUrl = "https://drive.google.com/uc?export=download&id=16Xu5T2RpboZs4Nv-F0T_tIWlqjv074Vd";
      const videoPath = path.join(__dirname, "rahad_info_video.mp4");

      // Download video
      const response = await axios.get(videoUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Send message with video
      await api.sendMessage(
        { body, attachment: fs.createReadStream(videoPath) },
        event.threadID
      );

      // Delete video
      fs.unlinkSync(videoPath);

    } catch (err) {
      console.error("Error in info command:", err);
      api.sendMessage("❌ Failed to fetch info or video.", event.threadID);
    }
  }
};
