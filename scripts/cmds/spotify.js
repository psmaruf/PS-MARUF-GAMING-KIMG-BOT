const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const downloadDir = path.join(__dirname, "cache");
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

let spotifySearchCache = {}; // Thread-wise result cache

module.exports = {
  config: {
    name: "spotify",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "mirrykal + ChatGPT + PrinceTech",
    description: "Spotify search + download using PrinceTech API",
    commandCategory: "media",
    usages: "[song name]",
    cooldowns: 5
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("🎧 Gaane ka naam to likho!", event.threadID);
    }

    const query = encodeURIComponent(args.join(" "));
    const searchUrl = `https://api.princetechn.com/api/search/spotifysearch?apikey=prince&query=${query}`;

    try {
      const res = await axios.get(searchUrl);
      const results = res.data?.results?.slice(0, 7);

      if (!results || results.length === 0) {
        return api.sendMessage("❌ Koi gaana nahi mila!", event.threadID);
      }

      spotifySearchCache[event.threadID] = results;

      let msg = "🎶 Spotify Search Results:\n\n";
      results.forEach((track, i) => {
        msg += `${i + 1}. ${track.title} - ${track.artist} (${track.duration})\n`;
      });
      msg += "\n🔢 Reply with number (1-7) to download the song.";

      api.sendMessage(msg, event.threadID);
    } catch (err) {
      console.error("Search Error:", err.message);
      api.sendMessage("❌ Search failed, try again later.", event.threadID);
    }
  },

  handleEvent: async function ({ api, event }) {
    const msg = event.body.trim();
    if (!/^[1-7]$/.test(msg)) return;

    const choice = parseInt(msg);
    const selectedTrack = spotifySearchCache[event.threadID]?.[choice - 1];
    if (!selectedTrack) return;

    delete spotifySearchCache[event.threadID]; // Clear after one-time use

    const downloadApi = `https://api.princetechn.com/api/download/spotifydl?apikey=prince&url=${encodeURIComponent(selectedTrack.url)}`;

    api.sendMessage(`⏬ Downloading "${selectedTrack.title}"...`, event.threadID);

    try {
      const res = await axios.get(downloadApi);
      const data = res.data?.result;

      if (!data || !data.download_url) {
        return api.sendMessage("❌ Failed to fetch download link.", event.threadID);
      }

      // Message with title, duration, thumbnail
      const infoMsg = {
        body: `🎧 Title: ${data.title}\n⏱ Duration: ${data.duration}`,
        attachment: await global.utils.getStreamFromURL(data.thumbnail)
      };
      api.sendMessage(infoMsg, event.threadID);

      // Prepare file
      const safeName = data.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = path.join(downloadDir, `${safeName}.mp3`);

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

      // Send MP3 file
      await api.sendMessage({
        body: `✅ Here's your song: ${data.title}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      // Delete after 10 sec
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 10000);

    } catch (e) {
      console.error("Download error:", e.message);
      api.sendMessage("❌ Song download failed.", event.threadID);
    }
  }
};
