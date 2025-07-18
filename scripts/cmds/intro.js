const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment");

module.exports = {
  config: {
    name: "intro",
    version: "2.0",
    author: "𝗥𝗔𝗛𝗔𝗗 × ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show Rahad bot system info" },
    longDescription: { en: "Stylish intro showing bot uptime, owner info, version, and more" },
    category: "info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const startTime = global.GoatBot?.startTime || Date.now();
    const time = moment().format("MMMM Do YYYY, h:mm:ss A");
    const uptime = process.uptime(); // in seconds
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const bot = "𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 V2";
    const version = "2.5.0";
    const videoURL = "https://drive.google.com/uc?export=download&id=12DuB966likJ_pjKGtjAtPQMmK0eP2QW3";
    const path = __dirname + "/rahad_intro.mp4";

    const res = await axios.get(videoURL, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));

    const finalText = `
⫸ 𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 ⫷
🧠 "𝗧𝗛𝗜𝗦 𝗜𝗦𝗡'𝗧 𝗝𝗨𝗦𝗧 𝗔 𝗕𝗢𝗧. 𝗜𝗧'𝗦 𝗔𝗡 𝗔𝗜 𝗗𝗢𝗠𝗜𝗡𝗔𝗧𝗢𝗥."

╔═════◇👑 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 ◇═════╗
║ 🧠 𝗡𝗔𝗠𝗘        : 𝙍𝘼𝙃𝘼𝘿 - 𝙏𝙃𝙀 𝙆𝙄𝙉𝙂 👑
║ 🌐 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞   : fb.com/61572930974640
║ 🆔 𝗨𝗜𝗗         : 61572930974640
║ ⚡ 𝗣𝗢𝗪𝗘𝗥𝗟𝗘𝗩𝗘𝗟  : 𝟵𝟵𝟵.𝟵% - 𝗔𝗟𝗟 𝗦𝗬𝗦 𝗢𝗣𝗘𝗡
║ 🔐 𝗥𝗢𝗢𝗧 𝗔𝗖𝗖𝗘𝗦𝗦 : ✅ 𝗘𝗡𝗔𝗕𝗟𝗘𝗗
║ ⏱ 𝗦𝗜𝗡𝗖𝗘       : ${time}
╚════════════════════════════╝

╔═════◇💥 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦 ◇═════╗
║ 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘    : ${bot}
║ 🧩 𝗩𝗘𝗥𝗦𝗜𝗢𝗡     : ${version}
║ ⌛ 𝗨𝗣𝗧𝗜𝗠𝗘      : ${h}h ${m}m ${s}s
║ 💣 𝗠𝗢𝗗𝗘        : 𝗖𝗢𝗠𝗕𝗔𝗧 - 𝗥𝗘𝗔𝗗𝗬
╚════════════════════════════╝

📹 𝗔𝗧𝗧𝗔𝗖𝗛𝗘𝗗 𝗩𝗜𝗗𝗘𝗢 ✔️
`;

    return api.sendMessage({
      body: finalText,
      attachment: fs.createReadStream(path)
    }, event.threadID, () => fs.unlinkSync(path), event.messageID);
  }
};
