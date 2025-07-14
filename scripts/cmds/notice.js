const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "2.0",
    author: "RaHaD",
    countDown: 5,
    role: 2,
    shortDescription: "Send notice + multiple Google Drive videos to all groups",
    longDescription: "Send notice message with multiple Google Drive videos sequentially to all groups.",
    category: "owner",
    guide: "{pn}",
    envConfig: {
      delayPerGroup: 300,
      videoLinks: [
        "https://drive.google.com/file/d/1-ZlKd-Gp3aDYMncf_5G2wSuSLMxEGPSI/view?usp=drivesdk",
        "https://drive.google.com/file/d/1-nI4xKS6Kmgk535JCJ0ImzWEz27Da8f_/view?usp=drivesdk",
        "https://drive.google.com/file/d/1-lL4N88ypSZqK-soaeGVB24psIsZCnTW/view?usp=drivesdk",
        "https://drive.google.com/file/d/1-kJ3l2B8TFSSFU7_ez4b_ZaLTe3DTKUM/view?usp=drivesdk",
        "https://drive.google.com/file/d/1-e3bORf0AyDhm1riFPQAuGNOu_IObMnu/view?usp=drivesdk",
        "https://drive.google.com/file/d/1-w0BXspoRULrPVm7ROCowj6hlWOQZWF5/view?usp=drivesdk",
        "https://drive.google.com/file/d/10uJUJk-97wh8enwLthimYojLUAnocR4m/view?usp=drivesdk",
        "https://drive.google.com/file/d/10pJ8In6C6bbJ4nE8uaBRFWv8pZgo0KWP/view?usp=drivesdk",
        "https://drive.google.com/file/d/10ld50yHKEd7MHi6S8L0FQqXXmCpDhT8B/view?usp=drivesdk",
        "https://drive.google.com/file/d/10kdiOwP5CMakfve45mvey4-D1GZjoiUm/view?usp=drivesdk",
        "https://drive.google.com/file/d/10iRCvmPZ4_rBxvCawallBt_Tc2tz9-Kw/view?usp=drivesdk",
        "https://drive.google.com/file/d/10fcQBzL7XFh9ZYpWPxKH3JiWcXWByF3Y/view?usp=drivesdk",
        "https://drive.google.com/file/d/10YNX3AvzuC5EwW2fcS10QIFlRtVy4fh5/view?usp=drivesdk",
        "https://drive.google.com/file/d/10TfPfZBCSKh8ujfaw3-rFt0qz_a-ZlYS/view?usp=drivesdk",
        "https://drive.google.com/file/d/10QT4fsr_pxGuMtE-BxAuJjoWkvC423QN/view?usp=drivesdk",
        "https://drive.google.com/file/d/10ORF3nmV0VWh9q5rE5443FFjKx5GtfU5/view?usp=drivesdk",
        "https://drive.google.com/file/d/10K9sOXzCUGCMIrFkWjAnTfdeoc1pu8gh/view?usp=drivesdk",
        "https://drive.google.com/file/d/10IV4zdjZJCw5e11ENiS9iXuMuJLkLUTW/view?usp=drivesdk",
        "https://drive.google.com/file/d/10C6TqgmRLC8fFE9RE2kdPgFA1lbaTiNO/view?usp=drivesdk",
        "https://drive.google.com/file/d/105Db-qiXxzCX2prBrbormEaJj2EkqGOu/view?usp=drivesdk",
        "https://drive.google.com/file/d/10-nDD_t_CuDJw1_6zT_6kswZE3BAuVQq/view?usp=drivesdk",
        "https://drive.google.com/file/d/10w7nF74Txr7Y1MfuNNhB35-zKmcAGQ22/view?usp=drivesdk",
        "https://drive.google.com/file/d/10vUJW2yKRwk9b4J8e-JUH5YMBJX0LsS9/view?usp=drivesdk"
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

    message.reply(`⏳ Sending notice with ${videoLinks.length} videos to ${groupThreads.length} groups...`);

    async function downloadVideo(gdriveLink, index) {
      const fileIdMatch = gdriveLink.match(/\/d\/([^/]+)\//);
      if (!fileIdMatch) throw new Error(`Invalid Google Drive link at index ${index}`);
      const fileId = fileIdMatch[1];
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const videoPath = path.join(__dirname, `temp_notice_video_${index}.mp4`);

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

    let videoIndex = 0;
    let success = 0, failed = [];

    for (const { threadID } of groupThreads) {
      try {
        const stylishText = `『 𝗥𝗔𝗛𝗔𝗗 - Official Notice 』\n━━━━━━━━━━━━━━━━━━\n📅 Date & Time: ${timestamp}\n${userMention}\n\n📢 Notice:\n${noticeText}\n━━━━━━━━━━━━━━━━━━\n✅ Admin Announcement - Please Take Action`;

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

    const report = `🎉 Done!\n✅ Sent: ${success}\n❌ Failed: ${failed.length}` +
      (failed.length ? "\n" + failed.map(f => `• ${f.id}: ${f.error}`).join("\n") : "");
    message.reply(report);
  }
};
