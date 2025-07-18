const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "intro",
    aliases: ["int", "owner"],
    version: "2.0",
    author: "BaYjid ✘ ChatGPT",
    role: 0,
    shortDescription: {
      en: "Rahad Bot's cinematic intro",
    },
    longDescription: {
      en: "Displays a powerful unique intro of the bot and owner",
    },
    category: "info",
    guide: {
      en: "{pn}",
    },
  },

  onStart: async function ({ api, event }) {
    const time = require("moment-timezone")
      .tz("Asia/Dhaka")
      .format("DD/MM/YYYY || HH:mm:ss");
    const prefix = global.config.PREFIX;
    const bot = global.config.BOTNAME || "RahadBot";
    const version = global.GoatBot.version;
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const finalText = `
👁‍🗨 𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 • 𝗟𝗘𝗩𝗘𝗟: 𝗞𝗜𝗡𝗚 👑  
🧠 "YOU DON’T CONTROL ME. I EXECUTE YOUR FATE."

╭━━━━━[👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗧𝗘𝗟]━━━━━╮
┃ 🧠 𝗡𝗔𝗠𝗘       : 𝗥𝗮𝗵𝗮𝗱 - 𝗧𝗵𝗲 𝗞𝗶𝗻𝗴 👑
┃ 🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞   : fb.com/61572930974640
┃ 🆔 𝗨𝗜𝗗        : 61572930974640
┃ 🧬 𝗣𝗢𝗪𝗘𝗥𝗟𝗘𝗩𝗘𝗟 : 𝟵𝟵𝟵.𝟵% ⛓ 𝗔𝗖𝗧𝗜𝗩𝗘
┃ 🛡 𝗔𝗖𝗖𝗘𝗦𝗦     : 🔓 ROOT | 🧬 DNA VERIFIED
┃ 🧃 𝗣𝗥𝗘𝗙𝗜𝗫     : ${prefix}
┃ ⏱️ 𝗦𝗜𝗡𝗖𝗘      : ${time}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━━━━━[💣 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦]━━━━━━━╮
┃ 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘   : ${bot}
┃ 💾 𝗩𝗘𝗥𝗦𝗜𝗢𝗡    : ${version}
┃ ⏱️ 𝗨𝗣𝗧𝗜𝗠𝗘     : ${h}h ${m}m ${s}s
┃ 💣 𝗦𝗧𝗔𝗧𝗨𝗦     : ARMED ☠️ ACTIVE
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🧬 WARNING: This bot is not just code.  
🥶 Disrespect = auto obliteration.
🎬 Visual Intro Attached Below.
`.trim();

    // 🧠 VIDEO DOWNLOAD + SEND
    const url =
      "https://drive.google.com/uc?export=download&id=12DuB966likJ_pjKGtjAtPQMmK0eP2QW3";
    const filePath = path.join(__dirname, "rahad_intro.mp4");

    try {
      const { data, headers } = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: finalText,
            attachment: fs.createReadStream(filePath),
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error("Video write error:", err);
        api.sendMessage(finalText, event.threadID, event.messageID);
      });
    } catch (error) {
      console.error("Video download error:", error);
      api.sendMessage(finalText, event.threadID, event.messageID);
    }
  },
};
