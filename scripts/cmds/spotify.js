const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

const spotifySearchCache = {}; // Keyed by threadID_senderID

module.exports = {
  config: {
    name: "spotify",
    aliases: ["spot", "spt"],
    version: "2.0.0",
    author: "mirrykal + ChatGPT + PrinceTech",
    countDown: 5,
    role: 0,
    shortDescription: "Search and download songs from Spotify",
    longDescription: "Search Spotify songs using PrinceTech API and download them as MP3",
    category: "media",
    guide: {
      en: "{pn} [song name] » Search Spotify\nReply with 1-7 to download"
    }
  },

  onStart: async function ({ message, args, event }) {
    if (!args[0]) {
      return message.reply("🎧 Please enter the name of a song.");
    }

    const query = encodeURIComponent(args.join(" "));
    const searchUrl = `https://api.princetechn.com/api/search/spotifysearch?apikey=prince&query=${query}`;

    try {
      const res = await axios.get(searchUrl);
      const results = res.data?.results?.slice(0, 7);

      if (!results || results.length === 0) {
        return message.reply("❌ No results found for your query.");
      }

      const cacheKey = `${event.threadID}_${event.senderID}`;
      spotifySearchCache[cacheKey] = results;

      let replyMsg = `🎶 𝗦𝗽𝗼𝘁𝗶𝗳𝘆 𝗥𝗲𝘀𝘂𝗹𝘁𝘀:\n\n`;
      results.forEach((track, index) => {
        replyMsg += `${index + 1}. ${track.title} - ${track.artist} (${track.duration})\n`;
      });
      replyMsg += `\n🔢 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗮 𝗻𝘂𝗺𝗯𝗲𝗿 (1-7) 𝘁𝗼 𝗴𝗲𝘁 𝘁𝗵𝗲 𝘀𝗼𝗻𝗴.`;

      message.reply(replyMsg);
    } catch (err) {
      console.error("Spotify search error:", err.message);
      message.reply("❌ Failed to search. Try again later.");
    }
  },

  onMessage: async function ({ message, event }) {
    const reply = event.body?.trim();
    if (!/^[1-7]$/.test(reply)) return;

    const choice = parseInt(reply);
    const cacheKey = `${event.threadID}_${event.senderID}`;
    const selected = spotifySearchCache[cacheKey]?.[choice - 1];
    if (!selected) return;

    delete spotifySearchCache[cacheKey]; // One-time use

    const downloadUrl = `https://api.princetechn.com/api/download/spotifydl?apikey=prince&url=${encodeURIComponent(selected.url)}`;

    try {
      await message.reply(`⏬ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴: "${selected.title}"`);

      const res = await axios.get(downloadUrl);
      const data = res.data?.result;
      if (!data || !data.download_url) {
        return message.reply("❌ Could not fetch the download link.");
      }

      // Send info message with thumbnail
      const info = {
        body: `🎧 𝗧𝗶𝘁𝗹𝗲: ${data.title}\n⏱ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${data.duration}`,
        attachment: await global.utils.getStreamFromURL(data.thumbnail)
      };
      message.reply(info);

      // Download MP3
      const safeTitle = data.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = path.join(cacheDir, `${safeTitle}.mp3`);
      const file = fs.createWriteStream(filePath);

      await new Promise((resolve, reject) => {
        https.get(data.download_url, (res) => {
          res.pipe(file);
          file.on("finish", () => file.close(resolve));
        }).on("error", (err) => {
          fs.unlinkSync(filePath);
          reject(err);
        });
      });

      // Send MP3
      await message.reply({
        body: `✅ 𝗛𝗲𝗿𝗲'𝘀 𝘆𝗼𝘂𝗿 𝘀𝗼𝗻𝗴: ${data.title}`,
        attachment: fs.createReadStream(filePath)
      });

      // Delete after 10 seconds
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 10000);

    } catch (e) {
      console.error("Spotify download error:", e.message);
      message.reply("❌ Failed to download the song.");
    }
  }
};
