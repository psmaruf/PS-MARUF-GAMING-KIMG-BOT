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

// Fancy fonts + emojis for variety
const fontStyles = [
  (txt) => `🦇 𝔊𝔬𝔱𝔥𝔦𝔠 𝔚𝔬𝔯𝔡𝔰: ${txt} 🕸️`,
  (txt) => `✨ 𝓔𝓵𝓮𝓰𝓪𝓷𝓽 𝓢𝓹𝓮𝓵𝓵: ${txt} 🕯️`,
  (txt) => `🩸 𝕯𝖆𝖗𝖐 𝕾𝖎𝖌𝖓: ${txt} 🗡️`,
  (txt) => `🔮 𝓜𝔂𝓼𝓽𝓲𝓬 𝓕𝓵𝓪𝓻𝓮: ${txt} 🌙`,
  (txt) => `🕷️ 𝕾𝖕𝖎𝖉𝖊𝖗 𝕷𝖎𝖓𝖊: ${txt} 🕸️`,
  (txt) => `💀 𝙽𝚎𝚌𝚛𝚘 𝚃𝚎𝚡𝚝: ${txt} ☠️`,
  (txt) => `🦉 𝕲𝖍𝖔𝖘𝖙 𝕽𝖊𝖒𝖓𝖆𝖓𝖙: ${txt} 👻`,
];

// Cycle font styles for commands
function cycleFontStyle(i, txt) {
  return fontStyles[i % fontStyles.length](txt);
}

function roleToText(role) {
  switch (role) {
    case 0: return "🧛 Everyone";
    case 1: return "🦇 Group Admins";
    case 2: return "👑 Bot Masters";
    default: return "☠️ Unknown";
  }
}

// Rahad Bot Themed Header
function gothicHeader(title) {
  return `
╭━━━✧━━━━━━━━✧━━━╮
  🕯️ 𝕽𝖆𝖍𝖆𝖉 𝕭𝖔𝖙 𝕲𝖔𝖙𝖍𝖎𝖈 𝕳𝖊𝖑𝖕 🕯️
╰━━━━━━━━━━✧━━━━━━╯
       『 ${title} 』
━━━━━━━━━━━━━━━━━━
`;
}

// Your requested gothicFooter2
function gothicFooter() {
  return `
╭━━━༒━━━━━༒━━━╮
  🦉 𝑹𝒂𝒉𝒂𝒅 𝑩𝒐𝒕 𝑺𝒑𝒆𝒍𝒍𝒔 𝑬𝒏𝒅 🦉
╰━━━━༒━━━━༒━━━╯
`;
}

// Each command line with cycling fancy fonts + emoji
function gothicLine(cmd, idx) {
  return `┃ ${cycleFontStyle(idx, `『 ${cmd} 』`)}\n`;
}

module.exports = {
  config: Object.freeze({
    name: "help",
    version: "2.1",
    author: "Rahad",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📜 Unleash your command destiny..." },
    longDescription: { en: "🦇 Summon knowledge of all available spells (commands) and rituals (usages)." },
    category: "📚 Guidance",
    guide: { en: "🧛 {pn}help <command>" },
    priority: 1,
  }),

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    let filterAuthor = null;
    let filterCategory = null;

    if (args[0] === "-a" && args[1]) filterAuthor = args.slice(1).join(" ").toLowerCase();
    else if (args[0] === "-a" && !args[1]) return message.reply("🧛 Provide an author after `-a`.");
    else if (args[0] === "-c" && args[1]) filterCategory = args.slice(1).join(" ").toLowerCase();
    else if (args[0] === "-c" && !args[1]) return message.reply("🦇 Provide a category after `-c`.");

    const randId = VIDEO_IDS[Math.floor(Math.random() * VIDEO_IDS.length)];
    const videoUrl = `https://drive.google.com/uc?export=download&id=${randId}`;
    const videoPath = path.join(__dirname, "cache", `rahad_help_${randId}_${Date.now()}.mp4`);

    if (args.length > 0 && !args[0].startsWith("-")) {
      const cmdName = args[0].toLowerCase();
      const command = commands.get(cmdName) || commands.get(aliases.get(cmdName));
      if (!command) return message.reply(`🕸️ No such command found: ${cmdName}`);

      const c = command.config;
      const usage = (c.guide?.en || `${prefix}${c.name}`).replace(/{pn}/g, prefix).replace(/{n}/g, c.name);

      const detailMsg =
`${gothicHeader("🔮 COMMAND DETAILS")}
🧿 NAME        : 『 ${c.name} 』
📜 DESC        : ${c.longDescription?.en || "No description"}
🦴 ALIASES     : ${c.aliases?.length ? c.aliases.join(", ") : "None"}
📦 VERSION     : ${c.version || "1.0"}
🛡️ ROLE        : ${roleToText(c.role)}
⏳ COOLDOWN    : ${c.countDown || 1}s
✍️ AUTHOR      : ${c.author || "Unknown"}
🧩 USAGE       : ${usage}
${gothicFooter()}`;

      try {
        const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
        await fs.ensureDir(path.dirname(videoPath));
        await fs.writeFile(videoPath, Buffer.from(res.data, "binary"));

        await message.reply({ body: detailMsg, attachment: fs.createReadStream(videoPath) })
          .finally(() => fs.unlink(videoPath).catch(() => {}));
      } catch (e) {
        console.error("🧛 Video error:", e.message);
        return message.reply("⚠️ Could not fetch the help scroll... try again soon.");
      }
      return;
    }

    // Display full command list
    const categories = {};
    let total = 0;

    for (const [name, command] of commands) {
      const c = command.config;
      if (c.role > 1 && role < c.role) continue;
      if (filterAuthor && c.author?.toLowerCase() !== filterAuthor) continue;
      if (filterCategory && c.category?.toLowerCase() !== filterCategory) continue;

      const cat = c.category || "Unholy";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
      total++;
    }

    if (total === 0) {
      const f = filterAuthor ? `author "${filterAuthor}"` : `category "${filterCategory}"`;
      return message.reply(`🧛 No rituals found for ${f}.`);
    }

    let msg = gothicHeader("📖 SPELLBOOK");

    Object.keys(categories).sort().forEach(cat => {
      msg += `\n🕯️ CATEGORY: ✦ ${cat.toUpperCase()} ✦\n`;
      categories[cat].sort().forEach((cmd, i) => {
        msg += gothicLine(cmd, i);
      });
    });

    msg += `\n📊 TOTAL COMMANDS: ${total}\n`;
    msg += `📎 HINT: Try 『 ${prefix}help <command> 』for deep knowledge\n`;
    msg += gothicFooter();

    try {
      const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
      await fs.ensureDir(path.dirname(videoPath));
      await fs.writeFile(videoPath, Buffer.from(res.data, "binary"));

      await message.reply({ body: msg, attachment: fs.createReadStream(videoPath) })
        .finally(() => fs.unlink(videoPath).catch(() => {}));
    } catch (e) {
      console.error("🕷️ Gothic video error:", e.message);
      return message.reply(msg);
    }
  }
};
