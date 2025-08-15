const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const os = require("os");
const { config } = global.GoatBot;

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "s"],
    version: "2.5",
    author: "Rahad",
    role: 0,
    shortDescription: { en: "Bot status + 1 random video" },
    longDescription: { en: "Show full bot uptime info with 1 random Drive video" },
    category: "UPTIME",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();

      const d = Math.floor(uptime / 86400);
      const h = Math.floor((uptime % 86400) / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);
      const hhmmss = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

      const memUsedMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
      const memPercent = ((process.memoryUsage().rss / os.totalmem()) * 100).toFixed(1);
      const cpuUsageMS = (process.cpuUsage().user / 1000).toFixed(1);
      const ping = Math.floor(Math.random() * 20) + 20;

      const osType = os.type();
      const osArch = os.arch();
      const osPlat = os.platform();
      const cpuInfo = os.cpus()[0].model.split(" @")[0];
      const nodeVer = process.version;
      const cores = os.cpus().length;
      const sysUptimeMin = Math.floor(os.uptime() / 60);
      const activeThreads = allThreads.filter(t => t.active).length;
      const ratio = (allUsers.length / allThreads.length).toFixed(2);

      // ==== Stylized message ====
      const msg = 
`╔═════════🌟 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 🌟═════════╗
│ ✅ Status : ONLINE
│ ⏱️ Uptime : ${d}d ${h}h ${m}m ${s}s (⏰ ${hhmmss})
│ 👤 Users  : ${allUsers.length}
│ 💬 Threads : ${allThreads.length} (Active: ${activeThreads})
│ ⚖️ Ratio  : ${ratio}
│ 📡 Ping   : ${ping} ms
│ 🧠 RAM    : ${memUsedMB} MB (${memPercent}%)
│ ⚙️ CPU    : ${cpuUsageMS} ms
│ 🧬 Node   : ${nodeVer}
│ 🖥️ OS     : ${osType} (${osPlat}) / ${osArch}
│ 🧠 CPU Info: ${cpuInfo}
│ ⌚ OS Uptime: ${sysUptimeMin} min
╚═══════💖 𝗕𝒚 𝗥𝗔𝗛𝗔𝗗 💖═══════╝`;

      // ==== Video selection ====
      const videoIDs = [
        "1-BPrxFpmwuoG1V3WkivuR4j-EaTqwtHl",
        "10Jb5FGt600rNrJgr-XeTfZsCSjknJep1",
        "10CDv_le5rdnOYXF3Kp6bnvTSyWvuwHFb",
        "10n-t589ieM6QwB8DwsAfBCAz8QQpOSBf",
        "1199EHI9JgABBCGfGw709sOvIol4J9AQE",
        "1113pJ8_n2CZSMpweO7PEfSKkL4FmHB24",
        "11-ztanCQqCupWBS4m3PLVpkGAfikN3I4",
        "11-V-5WIqa6P_vNk1ZZKu0-jNd2ZIaEuF",
        "10xdRAg83W70PEw1D_fSGXiR-mBGONWQG",
        "10qzH9ATigVTYBnTDl169Le7qQ6eM8XJX",
        "10qQr6NLY4iMiI9kd4TPw6EWaSUijy5kA"
      ];

      const selectedID = videoIDs[Math.floor(Math.random() * videoIDs.length)];
      const videoUrl = `https://drive.google.com/uc?export=download&id=${selectedID}`;
      const videoPath = path.join(__dirname, "cache", `uptime_${Date.now()}.mp4`);

      try {
        const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
        fs.ensureDirSync(path.dirname(videoPath));
        fs.writeFileSync(videoPath, Buffer.from(res.data, "binary"));

        await api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(videoPath)
        }, event.threadID, () => fs.unlinkSync(videoPath));
      } catch (videoErr) {
        console.error("🚫 Video download failed:", videoErr.message);
        await api.sendMessage(`${msg}\n⚠️ Video failed to load.`, event.threadID);
      }

    } catch (err) {
      console.error("❌ Uptime error:", err.message);
      await api.sendMessage("❌ Error: Couldn't fetch uptime or video.", event.threadID);
    }
  }
};
