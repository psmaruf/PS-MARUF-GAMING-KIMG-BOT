const axios = require("axios");
const fs = require("fs-extra");

const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
  return base.data.api;
};

const config = {
  name: "autodl",
  version: "2.0",
  author: "Rahad",
  credits: "Rahad",
  description: "Auto download video from TikTok, Facebook, Instagram, YouTube, and more",
  category: "media",
  commandCategory: "media",
  usePrefix: true,
  prefix: true,
  dependencies: {
    "fs-extra": "",
  },
};

const onStart = () => {};

const onChat = async ({ api, event }) => {
  let dipto = event.body || "", ex, cp;
  try {
    if (
      dipto.startsWith("https://vt.tiktok.com") ||
      dipto.startsWith("https://www.tiktok.com/") ||
      dipto.startsWith("https://www.facebook.com") ||
      dipto.startsWith("https://www.instagram.com/") ||
      dipto.startsWith("https://youtu.be/") ||
      dipto.startsWith("https://youtube.com/") ||
      dipto.startsWith("https://x.com/") ||
      dipto.startsWith("https://www.instagram.com/p/") ||
      dipto.startsWith("https://pin.it/") ||
      dipto.startsWith("https://twitter.com/") ||
      dipto.startsWith("https://vm.tiktok.com") ||
      dipto.startsWith("https://fb.watch")
    ) {
      api.setMessageReaction("🐸", event.messageID, {}, true);
      const w = await api.sendMessage("🐸 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗯𝗮𝗯𝘆... 🫡", event.threadID);

      const response = await axios.get(`${await baseApiUrl()}/alldl?url=${encodeURIComponent(dipto)}`);
      const d = response.data;

      if (d.result.includes(".jpg")) {
        ex = ".jpg"; cp = "💌 𝗛𝗲𝗿𝗲'𝘀 𝘆𝗼𝘂𝗿 𝗽𝗵𝗼𝘁𝗼 🥰";
      } else if (d.result.includes(".png")) {
        ex = ".png"; cp = "💌 𝗛𝗲𝗿𝗲'𝘀 𝘆𝗼𝘂𝗿 𝗽𝗵𝗼𝘁𝗼 🥰";
      } else if (d.result.includes(".jpeg")) {
        ex = ".jpeg"; cp = "💌 𝗛𝗲𝗿𝗲'𝘀 𝘆𝗼𝘂𝗿 𝗽𝗵𝗼𝘁𝗼 🥰";
      } else {
        ex = ".mp4"; cp = "🎬 𝗩𝗶𝗱𝗲𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗱 💞";
      }

      const path = __dirname + `/cache/video${ex}`;
      fs.writeFileSync(path, Buffer.from((await axios.get(d.result, { responseType: "arraybuffer" })).data, "binary"));

      const tinyUrlResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${d.result}`);
      const shortLink = tinyUrlResponse.data;

      api.setMessageReaction("✅", event.messageID, {}, true);
      api.unsendMessage(w.messageID);

      await api.sendMessage({
        body: `
╭─〔 ☠️ ༒•ℛ𓂅⋈𓂅ᯅ•༒ 𝗦𝗬𝗦𝗧𝗘𝗠 ☠️ 〕─╮

${cp}

📎 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗟𝗜𝗡𝗞:
${shortLink}

☠️ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 ★彡༒•❄️𝗥𝗮𝗵𝗮𝘁❄️•༒彡★
╰─────────────⭓`,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    }
  } catch (err) {
    api.setMessageReaction("❌", event.messageID, {}, true);
    console.log(err);
    api.sendMessage(`❌ 𝗘𝗿𝗿𝗼𝗿: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports = {
  config,
  onChat,
  onStart,
  run: onStart,
  handleEvent: onChat,
};
