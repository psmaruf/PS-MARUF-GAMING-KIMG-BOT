const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "botinfo",
    aliases: ["info", "inf"],
    version: "2.5",
    author: "Rahad",
    role: 0,
    shortDescription: { en: "Vibey Bot info with Rahad.xxx sauce." },
    longDescription: { en: "Displays bot stats with Rahad coding & Rahad.xxx swag." },
    category: "Info",
    guide: { en: "Type: botinfo" },
    usePrefix: false,
    onChat: true
  },

  onStart: async function({ api, event }) {
    return sendBotInfo({ api, event });
  },

  onChat: async function({ event, api }) {
    const text = event.body?.toLowerCase().trim();
    if (text === "rahad" || text === "inf" || text === "info") {
      return sendBotInfo({ api, event });
    }
  }
};

async function downloadVideo(url, filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(filePath);
    res.body.pipe(fileStream);
    await new Promise((resolve, reject) => {
      res.body.on("end", resolve);
      res.body.on("error", reject);
    });
  }
  return filePath;
}

async function sendBotInfo({ api, event }) {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const threadMem = threadInfo.participantIDs.length;
    let genderMale = 0, genderFemale = 0;

    for (let z in threadInfo.userInfo) {
      const gender = threadInfo.userInfo[z].gender;
      if (gender === "MALE") genderMale++;
      else if (gender === "FEMALE") genderFemale++;
    }

    const qtv = threadInfo.adminIDs.length;
    const sl = threadInfo.messageCount;
    const threadName = threadInfo.threadName;
    const id = threadInfo.threadID;

    const timeStart = Date.now();
    await api.sendMessage("𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐮𝐩 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐣𝐮𝐢𝐜𝐞...", event.threadID);
    const ping = Date.now() - timeStart;

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeString = `${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬`;

    const now = new Date();
    const localTime = now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    const statusPool = ["𝐎𝐧𝐥𝐢𝐧𝐞", "𝐕𝐢𝐛𝐢𝐧𝐠", "𝐒𝐭𝐚𝐛𝐥𝐞", "𝐑𝐞𝐥𝐨𝐚𝐝𝐞𝐝", "𝐂𝐨𝐨𝐤𝐢𝐧𝐠 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬", "𝐑𝐞𝐚𝐝𝐲 𝐟𝐨𝐫 𝐂𝐡𝐚𝐨𝐬"];
    const botStatus = statusPool[Math.floor(Math.random() * statusPool.length)];

    // Video links (Google Drive direct download)
    const videos = [
      { url: "https://drive.google.com/uc?export=download&id=1EOpTqCc7w0D6yZ5cN9GpeX-bf6y0Klhe", name: "video1.mp4" },
      { url: "https://drive.google.com/uc?export=download&id=1EfjQcHLrQ7AGiLAtvXG0GHnJJ1pw9SQT", name: "video2.mp4" },
      { url: "https://drive.google.com/uc?export=download&id=1EXe36LeohYIGyYs8No36t0wK2w2BaHZl", name: "video3.mp4" },
      { url: "https://drive.google.com/uc?export=download&id=1EOzA3k6TyRC_dXBL0ZuSelkBrqKoJ9wA", name: "video4.mp4" },
      { url: "https://drive.google.com/uc?export=download&id=1EjW6jA0zsXcI_9H-16r-s9DLrVytYufK", name: "video5.mp4" },
      { url: "https://drive.google.com/uc?export=download&id=1EreYCtl3w3E-rFJkKgPU8HcyZv7UWiO_", name: "video6.mp4" }
    ];

    const attachments = [];
    for (let v of videos) {
      const filePath = await downloadVideo(v.url, v.name);
      attachments.push(fs.createReadStream(filePath));
    }

    const messageBody =
`╭─ <𝐁𝐎𝐓 𝐈𝐍𝐅𝐎> ─╮
│ 👑 𝐎𝐰𝐧𝐞𝐫: 𝐑𝐚𝐡𝐚𝐝
│ ⚙️ 𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐞𝐝 𝐛𝐲: 𝐑𝐚𝐡𝐚𝐝.𝐱𝐱𝐱
│ 📍 𝐑𝐞𝐠𝐢𝐨𝐧: 𝐀𝐬𝐢𝐚/𝐃𝐡𝐚𝐤𝐚
│ 🧬 𝐒𝐭𝐚𝐭𝐮𝐬: ${botStatus}
├──────────
│ 🕐 𝐓𝐢𝐦𝐞: ${localTime}
│ 🌀 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeString}
│ ⚡ 𝐏𝐢𝐧𝐠: ${ping}𝐦𝐬
│ 💍 𝐌𝐚𝐫𝐫𝐢𝐞𝐝: 𝓐𝓷𝓷𝓾'𝓼 𝐡𝐮𝐬𝐛𝐚𝐧𝐝
│ 📲 𝐖𝐡𝐚𝐭𝐬𝐚𝐩𝐩: +9180160 42533
├───────────
│ 💬 𝐆𝐫𝐨𝐮𝐩: ${threadName}
│ 🆔 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃: ${id}
│ 👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${threadMem} (♂️${genderMale} / ♀️${genderFemale})
│ 🛡️ 𝐀𝐝𝐦𝐢𝐧𝐬: ${qtv}
│ 🗨️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${sl}
╰───────────╯`;

    await api.sendMessage({ body: messageBody, attachment: attachments }, event.threadID);

  } catch (error) {
    console.error(error);
    api.sendMessage("𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐭𝐫𝐢𝐩𝐩𝐞𝐝 𝐢𝐧 𝐭𝐡𝐞 𝐦𝐚𝐭𝐫𝐢𝐱. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.", event.threadID);
  }
}
