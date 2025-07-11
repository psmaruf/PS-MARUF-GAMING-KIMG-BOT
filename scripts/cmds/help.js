const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// Video IDs from Google Drive
const VIDEO_IDS = [
  "1-1iSV2SyuP3TEH8IVkLIGN0_MQ8cVYjm",
  "1-ubkubbvyNcMi4a1HDa0Zl0FtjK_Hbvx",
  "109DxLi5McmXlww8PwIxjE6FsBVLLbScl",
  "108v-RR4HKmg3x8csHphcgh-ZNo3M_Zo2",
  "1-vD0mv3wGnAM0rmztYQuzxB2by2EgCMX"
];

module.exports = {
  config: Object.freeze({
    name: "help",
    version: "1.35",
    author: "BaYjid",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📖 View command usage + tutorial video" },
    longDescription: { en: "📜 View command usage and get tutorial video directly" },
    category: "ℹ️ Info",
    guide: { en: "🔹 {pn}help cmdName" },
    priority: 1,
  }),

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    let filterAuthor = null;
    let filterCategory = null;

    // Select a random video id and its URL
    const randId = VIDEO_IDS[Math.floor(Math.random() * VIDEO_IDS.length)];
    const videoUrl = `https://drive.google.com/uc?export=download&id=${randId}`;
    const videoPath = path.join(__dirname, "cache", `help_video_${randId}.mp4`);

    if (args[0] === "-a" && args[1]) {
      filterAuthor = args.slice(1).join(" ").toLowerCase();
    } else if (args[0] === "-c" && args[1]) {
      filterCategory = args.slice(1).join(" ").toLowerCase();
    } else if (args.length > 0 && !args[0].startsWith("-")) {
      // Show details of a specific command
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));
      if (!command) return message.reply(`❌ Command "${commandName}" not found.`);

      const config = command.config;
      const roleText = roleTextToString(config.role);
      const usage = (config.guide?.en || "No guide available.")
        .replace(/{pn}/g, prefix)
        .replace(/{n}/g, config.name);

      // Download video and send with details
      try {
        const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
        fs.ensureDirSync(path.dirname(videoPath));
        fs.writeFileSync(videoPath, Buffer.from(res.data, "binary"));

        return message.reply({
          body:
            `╔═━「 🦋 COMMAND DETAILS 」━═╗\n` +
            `🧸 Name: ${config.name}\n` +
            `📜 Desc: ${config.longDescription?.en || "No description"}\n` +
            `🔁 Aliases: ${config.aliases?.join(", ") || "None"}\n` +
            `📦 Version: ${config.version || "1.0"}\n` +
            `🛡️ Role: ${roleText}\n` +
            `⏳ Cooldown: ${config.countDown || 1}s\n` +
            `👑 Author: ${config.author || "Unknown"}\n` +
            `📘 Usage: ${usage}\n` +
            `╚════════════════════╝`,
          attachment: fs.createReadStream(videoPath),
        }, () => fs.unlinkSync(videoPath));
      } catch (e) {
        console.error("Video download error:", e.message);
        return message.reply("❌ Couldn't load help video. Try again later.");
      }
    }

    // Otherwise show full command list + video
    const categories = {};
    let total = 0;

    for (const [name, command] of commands) {
      const config = command.config;
      if (config.role > 1 && role < config.role) continue;
      if (filterAuthor && config.author?.toLowerCase() !== filterAuthor) continue;
      if (filterCategory && config.category?.toLowerCase() !== filterCategory) continue;

      const category = config.category || "Uncategorized";
      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
      total++;
    }

    if (total === 0) {
      const filterMsg = filterAuthor ? `author "${filterAuthor}"` : `category "${filterCategory}"`;
      return message.reply(`🚫 No commands found for ${filterMsg}.`);
    }

    let msg = `🌸 MALVINA BOT MENU 🌸\n`;

    Object.keys(categories).sort().forEach(category => {
      msg += `\n🕷️ Category: ${category.toUpperCase()}\n`;
      categories[category].sort().forEach(cmd => {
        msg += `⤷ 🎟️ Cmd: ${cmd}\n`;
      });
    });

    msg += `\n🌐 Total Commands: ${total}`;
    msg += `\n🔍 Tip: ${prefix}help <command> for details`;

    // Download video and send message + attachment
    try {
      const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.ensureDirSync(path.dirname(videoPath));
      fs.writeFileSync(videoPath, Buffer.from(res.data, "binary"));

      await message.reply({
        body: msg,
        attachment: fs.createReadStream(videoPath),
      }, () => fs.unlinkSync(videoPath));
    } catch (e) {
      console.error("Video download error:", e.message);
      return message.reply(msg);
    }
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "🌍 All Users";
    case 1: return "👑 Group Admins";
    case 2: return "🤖 Bot Admins";
    default: return "❓ Unknown";
  }
}
