const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

let lastVideoId = null; // Prevent immediate repeat

module.exports = {
  config: {
    name: "intro",
    version: "3.0.0",
    author: "RAHAD",
    role: 0,
    shortDescription: { en: "Stylish bot intro with random video" },
    longDescription: { en: "Sends highly styled intro and picks a non-repeating video each time." },
    category: "info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const time = process.uptime();
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    const dateFormatted = moment().tz("Asia/Dhaka").format("MMMM Do YYYY, h:mm:ss A");

    const videos = [
      "12exo69Tl2FtqGQeTNFFKuyyZPIr3TGLI",
      "12rj-Kf2OwOgsUeJoXmhEHk43untJt9jZ",
      "12nc7VbqIkO8xAM9gqCZXAIUtKW68kcFn"
    ];

    // Pick a new video ID, different from lastVideoId
    let videoId;
    do {
      videoId = videos[Math.floor(Math.random() * videos.length)];
    } while (videoId === lastVideoId && videos.length > 1);
    lastVideoId = videoId;

    const videoURL = `https://drive.google.com/uc?export=download&id=${videoId}`;
    const filePath = path.join(__dirname, `intro_${videoId}.mp4`);

    try {
      const res = await axios.get(videoURL, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, res.data);
    } catch (err) {
      return api.sendMessage("⚠️ Failed to download video.", event.threadID);
    }

    const msg = `
┏━━━━━━━━━━━━━━┓
┃ 𓆩⚙️ 𝙍𝘼𝙃𝘼𝘿 𝘽𝙊𝙏 𝙎𝙔𝙎𝙏𝙀𝙈 ⚙️𓆪
┃ “𝗧𝗛𝗜𝗦 𝗜𝗦𝗡'𝗧 𝗝𝗨𝗦𝗧 𝗔 𝗕𝗢𝗧, 𝗜𝗧'𝗦 𝗔𝗡 𝗔𝗜 𝗗𝗢𝗠𝗜𝗡𝗔𝗧𝗢𝗥.”
┗━━━━━━━━━━━━━━┛

✦『 👑 𝙊𝙒𝙉𝙀𝙍 𝙄𝙉𝙁𝙊 』✦
╭─────────────────────────╮
┃ 🪪 𝗡𝗔𝗠𝗘      : 𝙍𝘼𝙃𝘼𝘿 - 𝙏𝙃𝙀 𝙆𝙄𝙉𝙂 👑
┃ 🌐 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 : fb.com/61572930974640
┃ 🆔 𝗨𝗜𝗗       : 61572930974640
┃ ⚡ 𝗣𝗢𝗪𝗘𝗥     : 999.9% ⚙ AI CORE
┃ 🔓 𝗥𝗢𝗢𝗧      : ✅ ENABLED
┃ 🕓 𝗗𝗔𝗧𝗘       : ${dateFormatted}
╰─────────────────────────╯

✦『 💻 𝙎𝙔𝙎𝙏𝙀𝙈 𝙎𝙏𝘼𝙏𝙐𝙎 』✦
╭─────────────────────────╮
┃ 🤖 𝗕𝗢𝗧        : 𝙍𝘼𝙃𝘼𝘿 𝘽𝙊𝙏 𝙑𝟮
┃ 🧩 𝗩𝗘𝗥𝗦𝗜𝗢𝗡  : 3.0.0
┃ ⌛ 𝗨𝗣𝗧𝗜𝗠𝗘    : ${uptime}
┃ 🧠 𝗠𝗢𝗗𝗘       : COMBAT — LIVE ⚔️
╰─────────────────────────╯

📎 𝙑𝙄𝘿𝙀𝙊 𝘼𝙏𝙏𝘼𝘾𝙃𝙀𝘿 ✅
`;

    api.sendMessage(
      {
        body: msg,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => fs.unlinkSync(filePath)
    );
  }
};
