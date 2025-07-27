const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { utils } = global;

const VIDEO_IDS = [
  "1-WKsuSsLsO8BKc2Oil0KAxvgcwcsFTA3",
  "1-8VSzbLm7c2eBesp8YwwvJxdhs0dcFSL",
  "102gwONoMStLZxNUuRH7SQ0j8mmwoGMg6",
  "10QycYgsTagrN90cWJCIWWVwmps2kk_oF",
  "10yCXj_k-vQ3JZ4CDBI47q1QAGStgqGGf",
  "10fnG0B9mjJm7kiOfhCmxaWJAnO6byg7h",
  "10bLixrdA5AMDX_ghc0gh2KrNqFnlXCWt",
  "10hN25pp9xP3ta7-nRxqRDeqRDYSQsi8t",
  "10tylA-0PZt29bEwbMQliFJRLyNgpUSPy",
  "10igHuFfPMYdAXE5jHJg7E1Bg_EmNbsxp",
  "11Xke5bDTf1wVmVTyztfQoi59wqJ-cHyJ",
  "11zdP9h5IEQsHIbyMXU180TDrVwPWev2Y",
  "11z3srLyFgG0QhNeC9VoVfhxNrfanRYTq",
  "11fe0PJXCJ3qbmJ_SgPEHK03_NPk48ATa"
];

module.exports = {
  config: {
    name: "prefix",
    version: "2.0",
    author: "BaYjid + Rahad",
    countDown: 5,
    role: 0,
    description: "🛠️ Change bot prefix or show it with a video",
    category: "⚙️ Configuration",
    guide: {
      en:
        "╔═『 𝗣𝗥𝗘𝗙𝗜𝗫 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 』═╗\n"
        + "🔧 {pn} <new prefix> ➤ Change group prefix\n"
        + "🌐 {pn} <new prefix> -g ➤ Global prefix (admin only)\n"
        + "♻️ {pn} reset ➤ Reset to default prefix\n"
        + "💬 Type `prefix` ➤ Show current prefix + video\n"
        + "╚════════════════════════╝"
    }
  },

  langs: {
    en: {
      reset:
        "╔═『 ♻️ 𝗥𝗘𝗦𝗘𝗧 𝗣𝗥𝗘𝗙𝗜𝗫 』═╗\n"
        + "✅ Prefix reset to default: [ %1 ]\n"
        + "╚════════════════════════╝",

      onlyAdmin:
        "╔═『 🚫 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗 』═╗\n"
        + "❌ Only 🛡️ Bot Admins can change the 🌍 global prefix.\n"
        + "╚════════════════════════╝",

      confirmGlobal:
        "╔═『 🌐 𝗚𝗟𝗢𝗕𝗔𝗟 𝗣𝗥𝗘𝗙𝗜𝗫 』═╗\n"
        + "🛠️ You're changing the global prefix.\n"
        + "✅ React to confirm.\n"
        + "╚════════════════════════╝",

      confirmThisThread:
        "╔═『 💬 𝗚𝗥𝗢𝗨𝗣 𝗣𝗥𝗘𝗙𝗜𝗫 』═╗\n"
        + "🛠️ You're changing this group's prefix.\n"
        + "✅ React to confirm.\n"
        + "╚════════════════════════╝",

      successGlobal:
        "╔═『 ✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 』═╗\n"
        + "🌍 Global Prefix updated to ➤ [ %1 ]\n"
        + "╚════════════════════════╝",

      successThisThread:
        "╔═『 ✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 』═╗\n"
        + "💬 Group Prefix updated to ➤ [ %1 ]\n"
        + "╚════════════════════════╝",

      myPrefix:
        "╔═━「 🧩 𝐁𝐎𝐓 𝐏𝐑𝐄𝐅𝐈𝐗 」━═╗\n"
        + "🪄 𝗚𝗹𝗼𝗯𝗮𝗹 : ❯❯ 〘 %1 〙\n"
        + "💬 𝗚𝗿𝗼𝘂𝗽  : ❯❯ 〘 %2 〙\n"
        + "⏰ 𝗧𝗶𝗺𝗲   : ❯❯ %3\n"
        + "╚═━「 🛠️ 𝗧𝘆𝗽𝗲 `%2help` 𝗳𝗼𝗿 𝗰𝗺𝗱𝘀 」━═╝"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };

    if (formSet.setGlobal && role < 2) {
      return message.reply(getLang("onlyAdmin"));
    }

    const confirmMessage = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");
    return message.reply(confirmMessage, (err, info) => {
      if (info?.messageID) {
        formSet.messageID = info.messageID;
        global.GoatBot.onReaction.set(info.messageID, formSet);
      }
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    }

    await threadsData.set(event.threadID, newPrefix, "data.prefix");
    return message.reply(getLang("successThisThread", newPrefix));
  },

  onChat: async function ({ event, message, getLang, threadsData }) {
    if (event.body?.toLowerCase()?.trim() !== "prefix") return;

    const prefix = utils.getPrefix(event.threadID);
    const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    const info = getLang("myPrefix", global.GoatBot.config.prefix, prefix, time);

    const randomID = VIDEO_IDS[Math.floor(Math.random() * VIDEO_IDS.length)];
    const videoURL = `https://drive.google.com/uc?export=download&id=${randomID}`;
    const videoPath = path.join(__dirname, `temp_${Date.now()}.mp4`);

    try {
      const res = await axios({ method: "GET", url: videoURL, responseType: "stream" });
      const writer = fs.createWriteStream(videoPath);
      res.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({ body: info, attachment: fs.createReadStream(videoPath) }, () => {
          fs.unlink(videoPath, () => {});
        });
      });

      writer.on("error", () => {
        message.reply(info + "\n⚠️ Video couldn't load.");
      });
    } catch (err) {
      message.reply(info + "\n⚠️ Failed to fetch video.");
    }
  }
};
