const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "2.1",
    author: "RaHaD + Fixed by ChatGPT",
    countDown: 5,
    role: 2,
    shortDescription: "Send notice with video to all groups",
    longDescription: "Send a notice message with one or more videos to all groups.",
    category: "owner",
    guide: "{pn} <message>",
    envConfig: {
      delayPerGroup: 300
    },
    // Replace Google Drive links with working public .mp4 links
    videoLinks: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    ]
  },

  onStart: async function({ message, api, event, args, commandName, envCommands }) {
    const { delayPerGroup, videoLinks } = envCommands[commandName];

    if (!args.length) return message.reply("❗ Please enter your notice message.");

    const noticeText = args.join(" ");
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    // Mention user if replying
    let mentions = [], userMention = "";
    if (event.messageReply?.senderID) {
      const info = await api.getUserInfo(event.messageReply.senderID);
      const name = info[event.messageReply.senderID]?.name || "User";
      userMention = `👤 Mentioned User: ${name}`;
      mentions.push({ tag: name, id: event.messageReply.senderID });
    }

    // Get all group threads except current one
    const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
    const groupThreads = allThreads.filter(t => t.isGroup && t.threadID !== event.threadID);
    if (groupThreads.length === 0) return message.reply("❌ No groups found.");

    message.reply(`⏳ Sending notice with ${videoLinks.length} video(s) to ${groupThreads.length} groups...`);

    // Helper function to download video
    async function downloadVideo(link, index) {
      const videoPath = path.join(__dirname, `temp_notice_video_${index}.mp4`);
      const response = await axios.get(link, { responseType: "stream" });
      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      return videoPath;
    }

    // Round-robin for video selection
    let videoIndex = 0;
    let success = 0, failed = [];

    for (const { threadID } of groupThreads) {
      try {
        const stylishText =
          `『 𝗥𝗔𝗛𝗔𝗗 - Official Notice 』\n━━━━━━━━━━━━━━━━━━\n📅 Date & Time: ${timestamp}\n${userMention}\n\n📢 Notice:\n${noticeText}\n━━━━━━━━━━━━━━━━━━\n✅ Admin Announcement - Please Take Action`;

        const videoPath = await downloadVideo(videoLinks[videoIndex], videoIndex);

        const formSend = {
          body: stylishText,
          mentions,
          attachment: fs.createReadStream(videoPath)
        };

        await api.sendMessage(formSend, threadID);
        success++;

        await fs.remove(videoPath);
        videoIndex = (videoIndex + 1) % videoLinks.length;

        await new Promise(r => setTimeout(r, delayPerGroup));

      } catch (err) {
        failed.push({ id: threadID, error: err.message });
      }
    }

    // Final report
    const report = `🎉 Done!\n✅ Sent: ${success}\n❌ Failed: ${failed.length}` +
      (failed.length ? "\n" + failed.map(f => `• ${f.id}: ${f.error}`).join("\n") : "");
    message.reply(report);
  }
};
