const fs = require("fs");
const path = require("path");

const videoLinks = [
  "https://drive.google.com/uc?export=download&id=1-WKsuSsLsO8BKc2Oil0KAxvgcwcsFTA3",
  "https://drive.google.com/uc?export=download&id=1-8VSzbLm7c2eBesp8YwwvJxdhs0dcFSL",
  "https://drive.google.com/uc?export=download&id=102gwON6P4YxDI0dK0N1A6QkF2ms1eW4d",
  "https://drive.google.com/uc?export=download&id=16h6cEFYYHqjNAuVsyVhJfoCg_1SBOO82"
];

module.exports = {
  config: {
    name: "help",
    aliases: ["h", "menu", "cmd", "commands", "rahad"],
    version: "2.0",
    author: "RAHAD Edit",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Show all commands"
    },
    longDescription: {
      en: "Shows a full list of available commands with style."
    },
    category: "🧠 System",
    guide: {
      en: "{pn} [name of command]"
    }
  },

  onStart: async function ({ message, args, commandName, event, threadsData, getLang }) {
    const allCommands = global.client.commands.values();
    const categories = {};
    let totalCommands = 0;

    for (const cmd of allCommands) {
      if (!categories[cmd.config.category]) {
        categories[cmd.config.category] = [];
      }
      categories[cmd.config.category].push(cmd.config.name);
      totalCommands++;
    }

    let helpText = `🌟💫💠 ⌜ 𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗧𝗘𝗠𝗣𝗟𝗘 ⌟ 💠💫🌟\n`;
    helpText += `╭───────────────⭓\n`;
    helpText += `┃ 🧩 Total Commands: ${totalCommands} 🔮\n`;
    helpText += `┃ 📘 Usage: .help [command] 🧠\n`;
    helpText += `╰───────────────⭓\n\n`;

    for (const [category, cmds] of Object.entries(categories)) {
      helpText += `🔰 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗬: ${category}\n`;
      helpText += `⤷ ${cmds.map(cmd => `.${cmd}`).join("     ")}\n\n`;
    }

    helpText += `💠━━━━━━━━━━━━━━━━━━━━━━💠\n`;
    helpText += `       🔱 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝑹𝑨𝑯𝑨𝑫 🔱\n`;
    helpText += `💠━━━━━━━━━━━━━━━━━━━━━━💠`;

    // Random video attach
    const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];
    const axios = require("axios");
    const { createWriteStream } = require("fs");

    const tmpPath = path.join(__dirname, "cache", `helpvid_${Date.now()}.mp4`);
    const writer = createWriteStream(tmpPath);

    const response = await axios({
      method: "GET",
      url: randomVideo,
      responseType: "stream"
    });

    response.data.pipe(writer);
    writer.on("finish", () => {
      message.reply({
        body: helpText,
        attachment: fs.createReadStream(tmpPath)
      }, () => fs.unlinkSync(tmpPath));
    });

    writer.on("error", (err) => {
      console.error("Video download failed:", err);
      message.reply(helpText);
    });
  }
};
