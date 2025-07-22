const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "2.1",
    author: "RaHaD",
    countDown: 5,
    role: 2,
    shortDescription: "Send notice + random Google Drive video to all groups",
    longDescription: "Send notice message with a different random video (no repeat per group) to all groups.",
    category: "owner",
    guide: "{pn} Your Notice Text",
    envConfig: {
      delayPerGroup: 300,
      videoLinks: [
        "https://drive.google.com/file/d/13imkKT8pMCJyWre454zZHn58V7bmvIDw/view?usp=drivesdk"
      ]
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands }) {
    const { delayPerGroup, videoLinks } = envCommands[commandName];

    if (!Array.isArray(videoLinks) || videoLinks.length === 0)
      return message.reply("❌ No video links found in configuration.");

    if (!args.length)
      return message.reply("❗ Please enter your notice message.");

    const noticeText = args.join(" ");
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    let mentions = [], userMention = "";
    if (event.messageReply?.senderID) {
      const info = await api.getUserInfo(event.messageReply.senderID);
      const name = info[event.messageReply.senderID]?.name || "User";
      userMention = `👤 Mentioned User: ${name}`;
      mentions.push({ tag: name, id: event.messageReply.senderID });
    }

    const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
    const groupThreads = allThreads.filter(t => t.isGroup && t.threadID !== event.threadID);
    if (groupThreads.length === 0) return message.reply("❌ No groups found.");

    message.reply(`🚀 𝗡𝗢𝗧𝗜𝗖𝗘 𝗦𝗘𝗤𝗨𝗘𝗡𝗖𝗘 𝗟𝗔𝗨𝗡𝗖𝗛𝗘𝗗...\n\n📤 Target Groups: ${groupThreads.length}\n🎞️ Video Mode: Random & Unique`);

    async function downloadVideo(gdriveLink, index) {
      const fileIdMatch = gdriveLink.match(/\/d\/([^/]+)\//);
      if (!fileIdMatch) throw new Error(`Invalid Google Drive link at index ${index}`);
      const fileId = fileIdMatch[1];
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const videoPath = path.join(__dirname, `temp_notice_video_${Date.now()}_${index}.mp4`);

      const response = await axios({
        method: "GET",
        url: downloadUrl,
        responseType: "stream"
      });

      if (response.headers['content-type']?.includes('text/html')) {
        throw new Error("🚫 Google Drive quota exceeded or invalid link.");
      }

      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return videoPath;
    }

    let success = 0, failed = [];
    const groupVideoHistory = {}; // Track which group got which video indexes

    for (const { threadID } of groupThreads) {
      try {
        const usedIndexes = groupVideoHistory[threadID] || [];
        const availableIndexes = videoLinks
          .map((_, i) => i)
          .filter(i => !usedIndexes.includes(i));

        if (availableIndexes.length === 0) {
          groupVideoHistory[threadID] = [];
          availableIndexes.push(...videoLinks.map((_, i) => i));
        }

        const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
        const selectedLink = videoLinks[randomIndex];
        const videoPath = await downloadVideo(selectedLink, randomIndex);

        const stylishText = `『 𝗥𝗔𝗛𝗔𝗗 - Official Notice 』\n━━━━━━━━━━━━━━━━━━\n📅 Date & Time: ${timestamp}\n${userMention}\n\n📢 Notice:\n${noticeText}\n━━━━━━━━━━━━━━━━━━\n✅ Admin Announcement - Please Take Action`;

        await api.sendMessage({
          body: stylishText,
          mentions,
          attachment: fs.createReadStream(videoPath)
        }, threadID);

        await fs.remove(videoPath);
        success++;

        if (!groupVideoHistory[threadID]) groupVideoHistory[threadID] = [];
        groupVideoHistory[threadID].push(randomIndex);

        await new Promise(r => setTimeout(r, delayPerGroup));
      } catch (err) {
        failed.push({ id: threadID, error: err.message });
      }
    }

    const report = `✅ 𝗡𝗢𝗧𝗜𝗖𝗘 𝗗𝗘𝗟𝗜𝗩𝗘𝗥𝗬 𝗥𝗘𝗣𝗢𝗥𝗧\n━━━━━━━━━━━━━━\n📤 Sent: ${success}\n❌ Failed: ${failed.length}` +
      (failed.length ? "\n\n⚠️ Failed List:\n" + failed.map(f => `• ${f.id}: ${f.error}`).join("\n") : "");
    message.reply(report);
  }
};
