const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 10000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "music2",
    version: "1.0.5",
    author: "Raj",
    countDown: 5,
    role: 0,
    shortDescription: "YouTube se MP3/MP4 download kare",
    longDescription: "YouTube se gaana ya video download karne ke liye",
    category: "media",
    guide: "{pn} [song name] [audio/video]",
  },

  onStart: async function ({ message, args }) {
    if (args.length === 0) {
      return message.reply("Gaana ya video ka naam toh bolo pyaare~");
    }

    const isVideo = args[args.length - 1].toLowerCase() === "video";
    const query = isVideo ? args.slice(0, -1).join(" ") : args.join(" ");

    const waitMsg = `Hehe... *"${query}"* ${isVideo ? "video" : "gaana"} dhundh rahi hoon na~ Ruko zara sabr karo!`;
    await message.reply(waitMsg);

    try {
      const results = await ytSearch(query);
      const top = results.videos[0];
      if (!top) throw new Error("Kuch nahi mila pyaare...");

      const videoUrl = top.url;
      const apiUrl = `https://nobita-music.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=${isVideo ? "video" : "audio"}`;

      const { data } = await axios.get(apiUrl);
      if (!data.file_url) throw new Error("Download link nahi mila...");

      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

      const ext = isVideo ? "mp4" : "mp3";
      const fileName = `${Date.now()}_${query.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      const filePath = path.join(downloadDir, fileName);

      const file = fs.createWriteStream(filePath);
      const downloadUrl = data.file_url.replace("http:", "https:");

      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode !== 200) return reject(new Error(`Download failed: ${response.statusCode}`));
          response.pipe(file);
          file.on("finish", () => file.close(resolve));
        }).on("error", (err) => reject(err));
      });

      await message.reply({
        body: `Tumhare liye *${top.title}*\nChannel: ${top.author.name}\nDuration: ${top.timestamp}\n\nEnjoy karo pyaare~`,
        attachment: fs.createReadStream(filePath),
      });

      deleteAfterTimeout(filePath, 10000);
    } catch (err) {
      message.reply(`Aww... kuch error aa gaya: ${err.message}`);
    }
  },
};
