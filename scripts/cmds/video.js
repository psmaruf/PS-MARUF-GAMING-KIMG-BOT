const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
  const res = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
  return res.data.api;
};

const downloadFile = async (url, path) => {
  const res = await axios.get(url, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(path);
    res.data.pipe(writer);
    writer.on("finish", () => resolve(fs.createReadStream(path)));
    writer.on("error", reject);
  });
};

const streamImage = async (url, path) => {
  const res = await axios.get(url, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(path);
    res.data.pipe(writer);
    writer.on("finish", () => resolve(fs.createReadStream(path)));
    writer.on("error", reject);
  });
};

module.exports = {
  config: {
    name: "video",
    version: "1.1.6",
    author: "Rahad",
    countDown: 5,
    role: 0,
    description: "🎬 ডাউনলোড করুন YouTube ভিডিও/অডিও/ইনফো",
    category: "media",
    usages: "{pn} -v/-a/-i <keyword/link>",
    usePrefix: true
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, senderID } = event;

    let action = args[0]?.toLowerCase() || '-v';
    if (!['-v', 'video', 'mp4', '-a', 'audio', 'mp3', '-i', 'info'].includes(action)) {
      args.unshift('-v');
      action = '-v';
    }

    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const urlYtb = args[1] ? checkurl.test(args[1]) : false;

    if (urlYtb) {
      try {
        const match = args[1].match(checkurl);
        const videoID = match ? match[1] : null;
        if (!videoID) return message.reply('🚫 সঠিক YouTube লিঙ্ক দিন!');

        const format = ['-v', 'video', 'mp4'].includes(action) ? 'mp4' : 'mp3';
        const path = `ytb_${format}_${videoID}.${format}`;

        const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=3`);

        await message.reply({
          body: `🎬 𝑻𝒊𝒕𝒍𝒆: ${data.title}\n🎞️ 𝑸𝒖𝒂𝒍𝒊𝒕𝒚: ${data.quality}\n⬇️ 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝒊𝒏 𝒑𝒓𝒐𝒈𝒓𝒆𝒔𝒔...`,
          attachment: await downloadFile(data.downloadLink, path)
        });

        fs.unlinkSync(path);
        return;

      } catch (e) {
        console.error(e);
        return message.reply('🚫 ডাউনলোড করতে ব্যর্থ হয়েছে!');
      }
    }

    args.shift();
    const keyWord = args.join(" ");
    if (!keyWord) return message.reply('❗ দয়া করে সার্চ কীওয়ার্ড দিন!');

    try {
      const searchResult = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0, 6);
      if (!searchResult.length) return message.reply(`🔍 "${keyWord}" এর জন্য কিছুই পাইনি!`);

      let msg = "🔎 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁𝘀:\n\n";
      const thumbnails = [];

      for (let i = 0; i < searchResult.length; i++) {
        const info = searchResult[i];
        thumbnails.push(streamImage(info.thumbnail, `thumb_${i + 1}.jpg`));
        msg += `🔢 ${i + 1}. ${info.title}\n🕒 ${info.time} | 📺 ${info.channel.name}\n\n`;
      }

      const sent = await message.reply({
        body: msg + "✏️ নম্বর রিপ্লাই দিন ডাউনলোডের জন্য!",
        attachment: await Promise.all(thumbnails)
      });

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "video",
        author: senderID,
        messageID: sent.messageID,
        result: searchResult,
        action
      });

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ সার্চে সমস্যা হয়েছে!");
    }
  },

  onReply: async function ({ event, message, Reply, api }) {
    const { author, result, action, messageID: oldMsgID } = Reply;
    const { senderID, body } = event;

    if (senderID !== author) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > result.length)
      return message.reply("❌ সঠিক নম্বর দিন!");

    try {
      api.unsendMessage(oldMsgID);
    } catch (e) {}

    const selectedVideo = result[choice - 1];
    const videoID = selectedVideo.id;

    if (['-v', 'video', 'mp4', '-a', 'audio', 'mp3'].includes(action)) {
      const format = ['-v', 'video', 'mp4'].includes(action) ? 'mp4' : 'mp3';
      const path = `ytb_${format}_${videoID}.${format}`;

      try {
        const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=3`);

        await message.reply({
          body: `🎬 𝑻𝒊𝒕𝒍𝒆: ${data.title}\n🎞️ 𝑸𝒖𝒂𝒍𝒊𝒕𝒚: ${data.quality}\n✅ 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑵𝒐𝒘`,
          attachment: await downloadFile(data.downloadLink, path)
        });

        fs.unlinkSync(path);

      } catch (e) {
        console.error(e);
        return message.reply("🚫 ডাউনলোড ব্যর্থ!");
      }
    }

    if (action === '-i' || action === 'info') {
      try {
        const { data } = await axios.get(`${await baseApiUrl()}/ytfullinfo?videoID=${videoID}`);
        await message.reply({
          body:
`📌 𝗧𝗶𝘁𝗹𝗲: ${data.title}
🕒 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${(data.duration / 60).toFixed(2)} mins
🎥 𝗥𝗲𝘀𝗼𝗹𝘂𝘁𝗶𝗼𝗻: ${data.resolution}
👁️ 𝗩𝗶𝗲𝘄𝘀: ${data.view_count}
👍 𝗟𝗶𝗸𝗲𝘀: ${data.like_count}
💬 𝗖𝗼𝗺𝗺𝗲𝗻𝘁𝘀: ${data.comment_count}
📂 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${data.categories[0]}
📢 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${data.channel}
🧑‍💻 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗿: ${data.uploader_id}
👥 𝗦𝘂𝗯𝘀: ${data.channel_follower_count}
🔗 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${data.channel_url}
🔗 𝗩𝗶𝗱𝗲𝗼: ${data.webpage_url}`,
          attachment: await streamImage(data.thumbnail, 'info_thumb.jpg')
        });
      } catch (e) {
        console.error(e);
        return message.reply("⚠️ ইনফো ফেচে সমস্যা!");
      }
    }
  }
};
