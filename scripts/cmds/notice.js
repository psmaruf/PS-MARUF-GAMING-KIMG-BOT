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
        "https://drive.google.com/file/d/18tKy-OBGIkubrOf2sf-aQKNUDO1wPGgT/view?usp=drivesdk",
        "https://drive.google.com/file/d/18l9gLjUbOyoNB32ngEUTfRSfu85bvMvQ/view?usp=drivesdk",
        "https://drive.google.com/file/d/18wIqnV7KkC6jJDC9Kh-Z4zFYGcQpxhhw/view?usp=drivesdk",
        "https://drive.google.com/file/d/18lkv5cj5W6JliRga434dvpe4regov0Kq/view?usp=drivesdk",
        "https://drive.google.com/file/d/18m41nicEv_-YfU9wiitXulG6DF4ubWRk/view?usp=drivesdk",
        "https://drive.google.com/file/d/17tGvbWdcxgUKAWDN0Zk151XL3XmI3i-k/view?usp=drivesdk"
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
      userMention = name;
      mentions.push({ tag: name, id: event.messageReply.senderID });
    }

    const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
    const groupThreads = allThreads.filter(t => t.isGroup && t.threadID !== event.threadID);
    if (groupThreads.length === 0) return message.reply("❌ No groups found.");

    message.reply(`⏳ Sending notice with random videos to ${groupThreads.length} groups...`);

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

      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return videoPath;
    }

    let success = 0, failed = [];
    const groupVideoHistory = {};

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

        const stylishText = `
╔═✪═✪═✪═✪═✪═✪═✪═╗
⚡⚡ 𝗥𝗔𝗛𝗔𝗗 𝓞𝓕𝓕𝓘𝓒𝓘𝓐𝓛 ⚡⚡
🅽🅾🆃🅸🅲🅴 🅱🅾🆃 ⚡⚡
╚═✪═✪═✪═✪═✪═✪═✪═╝

🗓️ 𝕯𝖆𝖙𝖊 & 𝕋𝖎𝖒𝖊: ✨ ${timestamp} ✨
${userMention ? `👤 𝓜𝓮𝓷𝓽𝓲𝓸𝓷𝗲𝗱: 💫 ${userMention}\n` : ""}

🗣️ 𝓝𝓸𝓽𝓲𝓬𝓮:
${noticeText.split('\n').map(line => `▶︎ ${line}`).join('\n')}

───────────────────────────────
⚠️ 𝓟𝓵𝓮𝓪𝓼𝓮 𝓣𝓪𝓴𝓮 𝓐𝓬𝓽𝓲𝓸𝓷! ⚠️
═══════════════════════════════
🎉 𝕿𝖍𝖆𝖓𝖐 𝖄𝖔𝖚 𝖋𝖔𝖗 𝕿𝖗𝖚𝖘𝖙𝖎𝖓𝖌 𝗥𝗔𝗛𝗔𝗗 𝕭𝖔𝖙! 🎉
═══════════════════════════════
`;

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

    const report = `🎉 Done!\n✅ Sent: ${success}\n❌ Failed: ${failed.length}` +
      (failed.length ? "\n" + failed.map(f => `• ${f.id}: ${f.error}`).join("\n") : "");
    message.reply(report);
  }
};
