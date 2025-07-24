const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    aliases: ["inf", "in", "Rahad", "owner"],
    version: "1.1",
    author: "Rahad",
    role: 0,
    shortDescription: { en: "Show bot & group info" },
    longDescription: { en: "Stylish HUD info with video 📽️" },
    category: "INFO",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, threadsData }) {
    const time = require("moment-timezone").tz("Asia/Dhaka").format("DD/MM/YYYY, hh:mm:ss A");
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    const threadInfo = await threadsData.get(event.threadID);
    const allUsers = threadInfo.members || [];
    const admins = allUsers.filter(u => u.admin);
    const male = allUsers.filter(u => u.gender === "MALE").length;
    const female = allUsers.filter(u => u.gender === "FEMALE").length;
    const totalMsg = threadInfo.totalMsg || 0;

    const body = `
┌────────[ 🤖 𝗥𝗔𝗛𝗔𝗗_𝗕𝗢𝗧 ]────────┐
│ 👑 𝗢𝘄𝗻𝗲𝗿: 𝗥𝗮𝗵𝗮𝗱
│ 🛠 𝗠𝗼𝗱𝘀: 𝗥𝗮𝗵𝗮𝗱 
│ 🌍 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: Asia/Dhaka
│ 🔋 𝗦𝘁𝗮𝘁𝘂𝘀: ⚡ Online
├────────[ ⏱️ 𝗦𝗬𝗦𝗧𝗘𝗠 ]────────┤
│ 🕒 𝗧𝗶𝗺𝗲: ${time}
│ ♻️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptimeStr}
│ ⚡ 𝗣𝗶𝗻𝗴: ${Date.now() - event.timestamp}ms
├───────[ 💬 𝗚𝗥𝗢𝗨𝗣 ]────────┤
│ 💬 𝗡𝗮𝗺𝗲: ${threadInfo.threadName}
│ 🆔 𝗜𝗗: ${event.threadID}
│ 👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${allUsers.length} (♂ ${male} / ♀ ${female})
│ 🛡 𝗔𝗱𝗺𝗶𝗻𝘀: ${admins.length}
│ 💌 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: ${totalMsg}
└────────────────────────────┘
    `.trim();

    const videoUrl = "https://drive.google.com/uc?export=download&id=16Xu5T2RpboZs4Nv-F0T_tIWlqjv074Vd";
    const videoPath = path.join(__dirname, "rahad_info_video.mp4");

    try {
      const res = await axios.get(videoUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(videoPath);
      res.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body,
          attachment: fs.createReadStream(videoPath)
        }, event.threadID, () => fs.unlinkSync(videoPath));
      });

      writer.on("error", err => {
        console.error("Video download failed:", err);
        api.sendMessage(body, event.threadID);
      });
    } catch (err) {
      console.error("Error fetching video:", err);
      return api.sendMessage(body, event.threadID);
    }
  }
};
