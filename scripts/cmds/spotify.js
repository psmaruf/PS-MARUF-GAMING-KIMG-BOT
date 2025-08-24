const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const downloadDir = path.join(__dirname, "cache");
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

// ========== Helper: Retry with Backoff ==========
async function fetchWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await axios.get(url, { timeout: 15000 });
    } catch (err) {
      if (i === retries) throw err;
      const wait = err.response?.headers?.["retry-after"] * 1000 || delay;
      console.log(`Retrying in ${wait / 1000}s...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

module.exports = {
  config: {
    name: "spotify",
    aliases: [],
    version: "2.4.0",
    author: "Rahad Boss",
    countDown: 5,
    role: 0,
    shortDescription: "Spotify search + download",
    longDescription: "Search and download Spotify songs using PrinceTech API (stable version)",
    category: "media",
    guide: "{pn} [song name]"
  },

  // ==================== MAIN COMMAND ====================
  onStart: async function ({ message, event, args }) {
    if (args.length === 0) {
      return message.reply("🎧 গান নাম লিখো ভাই!");
    }

    const query = encodeURIComponent(args.join(" "));
    const searchUrl = `https://api.princetechn.com/api/search/spotifysearch?apikey=prince&query=${query}`;

    try {
      const res = await fetchWithRetry(searchUrl);
      const results = res.data?.results?.slice(0, 7);

      if (!results || results.length === 0) {
        return message.reply("❌ কোনো গান পাওয়া যায়নি!");
      }

      let msg = "━━━━━━━━━━━━━━━━━━\n";
      msg += "🎵 𝗦𝗽𝗼𝘁𝗶𝗳𝘆 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁𝘀\n";
      msg += "━━━━━━━━━━━━━━━━━━\n\n";

      results.forEach((track, i) => {
        msg += `🔹 ${i + 1}. ${track.title}\n     👤 ${track.artist}\n     ⏱ ${track.duration}\n\n`;
      });

      msg += "━━━━━━━━━━━━━━━━━━\n";
      msg += "👉 Reply with number (1-7) to download.\n";
      msg += "━━━━━━━━━━━━━━━━━━";

      return message.reply(msg, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "spotify",
          author: event.senderID,
          results,
          messageID: info.messageID
        });
      });

    } catch (err) {
      console.error("Search Error:", err);
      return message.reply("❌ Search এ সমস্যা হয়েছে, একটু পরে চেষ্টা করো!");
    }
  },

  // ==================== REPLY HANDLER ====================
  onReply: async function ({ event, message, Reply, api }) {
    const msg = event.body.trim();
    if (!/^[1-7]$/.test(msg)) return;
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(msg);
    const selectedTrack = Reply.results?.[choice - 1];
    if (!selectedTrack) return message.reply("❌ Invalid choice!");

    // Delete old search message (optional)
    try {
      await api.unsendMessage(Reply.messageID);
    } catch (e) {
      console.warn("Unsend failed:", e.message);
    }

    const downloadApi = `https://api.princetechn.com/api/download/spotifydl?apikey=prince&url=${encodeURIComponent(selectedTrack.url)}`;

    await message.reply(`⏬ Downloading "${selectedTrack.title}"...`);

    try {
      const res = await fetchWithRetry(downloadApi);
      const data = res.data?.result;

      if (!data || !data.download_url) {
        return message.reply("❌ Download link পাওয়া যায়নি!");
      }

      // Save filename
      const safeName = data.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = path.join(downloadDir, `${safeName}.mp3`);

      // === Check cache ===
      if (fs.existsSync(filePath)) {
        console.log("Cache hit:", filePath);
        await message.reply({
          body: `🎵 𝗦𝗽𝗼𝘁𝗶𝗳𝘆\n\n✅ Cached song ready!\n🎧 ${data.title}`,
          attachment: fs.createReadStream(filePath)
        });
        return;
      }

      // Send thumbnail + info
      await message.reply({
        body:
`🎵 𝗦𝗽𝗼𝘁𝗶𝗳𝘆  

🎧 𝗧𝗶𝘁𝗹𝗲: ${data.title}  
👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${data.artist || "Unknown"}  
⏱ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${data.duration}  

🔥 𝗥𝗮𝗵𝗮𝗱 𝗕𝗼𝘀𝘀`,
        attachment: await global.utils.getStreamFromURL(data.thumbnail).catch(() => null)
      });

      // Download file
      const file = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        https.get(data.download_url, (res) => {
          res.pipe(file);
          file.on("finish", () => file.close(resolve));
        }).on("error", (err) => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          reject(err);
        });
      });

      // Send MP3
      await message.reply({
        body: `🎵 𝗦𝗽𝗼𝘁𝗶𝗳𝘆\n\n✅ আপনার গান রেডি!\n🎧 ${data.title}`,
        attachment: fs.createReadStream(filePath)
      });

    } catch (e) {
      console.error("Download error:", e);
      return message.reply("❌ Download এ সমস্যা হয়েছে!");
    }
  }
};
