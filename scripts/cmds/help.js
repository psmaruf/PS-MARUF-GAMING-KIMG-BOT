const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const VIDEO_IDS = [
  "1-1iSV2SyuP3TEH8IVkLIGN0_MQ8cVYjm",
  "1-ubkubbvyNcMi4a1HDa0Zl0FtjK_Hbvx",
  "109DxLi5McmXlww8PwIxjE6FsBVLLbScl",
  "108v-RR4HKmg3x8csHphcgh-ZNo3M_Zo2",
  "1-vD0mv3wGnAM0rmztYQuzxB2by2EgCMX"
];

function roleToText(role) {
  switch (role) {
    case 0: return "🌍 All Users";
    case 1: return "👑 Group Admins";
    case 2: return "🤖 Bot Admins";
    default: return "❓ Unknown";
  }
}

function formatCmdLine(cmd) {
  return `  • ⟿ 𝙲𝙼𝙳: [ ${cmd} ]\n`;
}

function createVipHeader(title) {
  const length = 30;
  const padding = Math.floor((length - title.length) / 2);
  const padStr = " ".repeat(padding);
  return `┏${"━".repeat(length)}┓\n┃${padStr}${title}${padStr}${title.length % 2 === 0 ? "" : " "}┃\n┗${"━".repeat(length)}┛\n`;
}

module.exports = {
  config: Object.freeze({
    name: "help",
    version: "1.35",
    author: "Rahad",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📚 Your command guide + tutorial video" },
    longDescription: { en: "🚀 View commands and get tutorial video attachment" },
    category: "ℹ️ Info",
    guide: { en: "🔹 {pn}help <command>" },
    priority: 1,
  }),

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    let filterAuthor = null;
    let filterCategory = null;

    if (args[0] === "-a" && args[1]) filterAuthor = args.slice(1).join(" ").toLowerCase();
    else if (args[0] === "-c" && args[1]) filterCategory = args.slice(1).join(" ").toLowerCase();

    const randId = VIDEO_IDS[Math.floor(Math.random() * VIDEO_IDS.length)];
    const videoUrl = `https://drive.google.com/uc?export=download&id=${randId}`;
    const videoPath = path.join(__dirname, "cache", `help_video_${randId}.mp4`);

    // Show specific command detail
    if (args.length > 0 && !args[0].startsWith("-")) {
      const cmdName = args[0].toLowerCase();
      const command = commands.get(cmdName) || commands.get(aliases.get(cmdName));
      if (!command) return message.reply(`❌ Command [${cmdName}] not found!`);

      const c = command.config;
      const roleText = roleToText(c.role);
      const usage = (c.guide?.en || "No usage info.").replace(/{pn}/g, prefix).replace(/{n}/g, c.name);

      try {
        const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
        await fs.ensureDir(path.dirname(videoPath));
        await fs.writeFile(videoPath, Buffer.from(res.data, "binary"));

        const detailMsg =
`${createVipHeader("✨ 𝓒𝓸𝓶𝓶𝓪𝓷𝓭 𝓓𝓮𝓽𝓪𝓲𝓵 ✨")}
📝 𝙽𝙰𝙼𝙴     : ${c.name}
📜 𝙳𝙴𝚂𝙲     : ${c.longDescription?.en || "No description"}
🎭 𝙰𝙻𝙸𝙰𝚂𝙴𝚂  : ${c.aliases?.length ? c.aliases.join(", ") : "None"}
📦 𝚅𝙴𝚁𝚂𝙸𝙾𝙽  : ${c.version || "1.0"}
👥 𝚁𝙾𝙻𝙴    : ${roleText}
⏰ 𝙲𝙾𝙾𝙻𝙳𝙾𝚆𝙽 : ${c.countDown || 1}s
👤 𝙰𝚄𝚃𝙷𝙾𝚁  : ${c.author || "Unknown"}
💡 𝚄𝚂𝙰𝙶𝙴   : ${usage}

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        await message.reply({ body: detailMsg, attachment: fs.createReadStream(videoPath) }, async () => {
          try { await fs.unlink(videoPath); } catch {}
        });
      } catch (e) {
        console.error("Video download error:", e.message);
        return message.reply("⚠️ Could not load help video, please try again later.");
      }
      return;
    }

    // Show full commands list
    const categories = {};
    let totalCommands = 0;

    for (const [name, command] of commands) {
      const c = command.config;
      if (c.role > 1 && role < c.role) continue;
      if (filterAuthor && c.author?.toLowerCase() !== filterAuthor) continue;
      if (filterCategory && c.category?.toLowerCase() !== filterCategory) continue;

      const cat = c.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
      totalCommands++;
    }

    if (totalCommands === 0) {
      const filterMsg = filterAuthor
        ? `author "${filterAuthor}"`
        : `category "${filterCategory}"`;
      return message.reply(`🚫 No commands found for ${filterMsg}.`);
    }

    let msg = createVipHeader("Rahad Bot Menu");

    Object.keys(categories).sort().forEach(cat => {
      msg += `▶ CATEGORY: ${cat.toUpperCase()}\n`;
      categories[cat].sort().forEach(cmd => {
        msg += formatCmdLine(cmd);
      });
      msg += "\n";
    });

    msg += `➤ 𝚃𝚘𝚝𝚊𝚕 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜: ${totalCommands}\n`;
    msg += `➤ 𝙷𝚒𝚗𝚝: Use [${prefix}help <command>] for details\n`;

    try {
      const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
      await fs.ensureDir(path.dirname(videoPath));
      await fs.writeFile(videoPath, Buffer.from(res.data, "binary"));

      await message.reply({ body: msg, attachment: fs.createReadStream(videoPath) }, async () => {
        try { await fs.unlink(videoPath); } catch {}
      });
    } catch (e) {
      console.error("Video download error:", e.message);
      return message.reply(msg);
    }
  }
};
