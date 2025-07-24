const fs = require("fs-extra");
const path = require("path");

const VIDEO_IDS = [
  "1-WKsuSsLsO8BKc2Oil0KAxvgcwcsFTA3",
  "1-8VSzbLm7c2eBesp8YwwvJxdhs0dcFSL",
  "102gwONJjVYk9YkjGTV4E_FZny5oQORlm",
  "10SptKmtbPo81mdZKEl3g-D-rvGmRZC2",
  "1kQ_AEy9cxzH0bOwPMaXg_jHRZOUm7dKe",
  "1-x7l8DLDhz6gRATYT5TDl68W6mf_Xe1L"
];

module.exports = {
  config: {
    name: "help",
    aliases: ["h", "menu", "rahad"],
    version: "2.0",
    author: "Rahad Edit by Bayjid",
    shortDescription: {
      en: "Show command list."
    },
    category: "general",
    guide: {
      en: ".help [command name]"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const allCommands = global.client.commands ? [...global.client.commands.values()] : [];
    const categories = {};
    let totalCommands = 0;

    for (const cmd of allCommands) {
      const category = cmd?.config?.category || "Uncategorized";
      const name = cmd?.config?.name || "unknown";

      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
      totalCommands++;
    }

    const lines = [];
    lines.push(`\n🌟💫💠 ⌜ 𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗧𝗘𝗠𝗣𝗟𝗘 ⌟ 💠💫🌟`);
    lines.push("╭───────────────⭓");
    lines.push(`┃ 🧩 Total Commands: ${totalCommands} 🔮`);
    lines.push("┃ 📘 Usage: .help [command] 🧠");
    lines.push("╰───────────────⭓\n");

    for (const [category, cmds] of Object.entries(categories)) {
      lines.push(`🎯 ${category.toUpperCase()} 𓆩✨𓆪`);
      lines.push(" " + cmds.map(cmd => `⤷ ⚡ .${cmd}`).join("     "));
      lines.push("");
    }

    lines.push("💠━━━━━━━━━━━━━━━━━━━━━━💠");
    lines.push("🔱 𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗠𝗘𝗡𝗨 🔱");
    lines.push("💠━━━━━━━━━━━━━━━━━━━━━━💠");

    const randomVideoId = VIDEO_IDS[Math.floor(Math.random() * VIDEO_IDS.length)];
    const videoUrl = `https://drive.google.com/uc?id=${randomVideoId}`;

    message.reply({
      body: lines.join("\n"),
      attachment: await global.utils.getStreamFromURL(videoUrl)
    });
  }
};
