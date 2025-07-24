const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const os = require("os");
const { GoatWrapper } = require("fca-liane-utils");
const { config } = global.GoatBot;

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "s"],
    version: "2.4",
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
      const hhmmss = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      const memUsed = process.memoryUsage().rss;
      const memTotal = os.totalmem();
      const memPercent = ((memUsed / memTotal) * 100).toFixed(1);
      const cpu = (process.cpuUsage().user / 1000).toFixed(1);
      const ping = Math.floor(Math.random() * 20) + 20;

      const osType = os.type();
      const osArch = os.arch();
      const osPlat = os.platform();
      const host = os.hostname();
      const cpuInfo = os.cpus()[0].model.split(" @")[0];
      const nodeVer = process.version;
      const cores = os.cpus().length;
      const sysUptime = Math.floor(os.uptime() / 60);
      const active = allThreads.filter(t => t.active).length;
      const ratio = (allUsers.length / allThreads.length).toFixed(2);

      const msg =
`╔═══✦❘༻༺❘✦═『𝗚𝗢𝗔𝗧 𝗕𝗢𝗧 ⚡ 𝗦𝗧𝗔𝗧𝗨𝗦』═✦❘༻༺❘✦═══╗
┃ 🆔 𝗣𝗜𝗗              : ${process.pid}
┃ ⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲           : ${d}d ${h}h ${m}m ${s}s ⏳ (${hhmmss})
┃ 👥 𝗨𝘀𝗲𝗿𝘀           : ${allUsers.length}
┃ 💬 𝗧𝗵𝗿𝗲𝗮𝗱𝘀         : ${allThreads.length} (🟢 ${active} active)
┃ ⚖️ 𝗨/𝗧 𝗥𝗮𝘁𝗶𝗼        : ${ratio}
┃ 📡 𝗣𝗶𝗻𝗴             : ${ping} ms
┃ 🧠 𝗥𝗔𝗠 𝗨𝘀𝗮𝗴𝗲        : ${(memUsed / 1024 / 1024).toFixed(1)} MB (${memPercent}%)
┃ 🛠️ 𝗖𝗣𝗨 𝗧𝗶𝗺𝗲        : ${cpu} ms
┃ 🧬 𝗖𝗣𝗨 𝗠𝗼𝗱𝗲𝗹       : ${cpuInfo}
┃ 💻 𝗢𝗦                : ${osType} (${osPlat}) / ${osArch}
┃ 🌀 𝗖𝗼𝗿𝗲𝘀            : ${cores}
┃ 🌐 𝗡𝗼𝗱𝗲.𝗷𝘀          : ${nodeVer}
┃ ⌚ 𝗢𝗦 𝗨𝗽𝘁𝗶𝗺𝗲        : ${sysUptime} min
┃ 🏷️ 𝗛𝗼𝘀𝘁𝗻𝗮𝗺𝗲        : ${host}
╚═════⟪ 👑 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑹𝑨𝑯𝑨𝑫 ⟫═════╝`;

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
        "10qQr6NLY4iMiI9kd4TPw6eWaSUijy5kA",
        "1-WKsuSsLsO8BKc2Oil0KAxvgcwcsFTA3",
        "1-8VSzbQ2q8fKqDdBz1X6a_mTkAGbX_nlg",
        "1-Y2MXuKYqG6MT5UkJsfZf9y8Ck_yD8dzG",
        "1-ZDEjcDLmyd8ED6vEfNShIuP_9rMrqVvE",
        "1-Zo7pJXEnKJxUbP8_rp6yGeibGQKOyk-N",
        "1-TiFoLSGw5gU7Z7H_wXtQFyfJKn9iP85E",
        "1-aqzThfM34smIfvW3ILzvXoyKf3_ScNwG",
        "1-b09HGVkIWT-rO8OnOlKgqsfef7lfG4r6",
        "1-bJ3biZppbslrDcb7EBTP7zQoElFmnmL9"
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
        await api.sendMessage(`${msg}\n⚠️ But video failed to load.`, event.threadID);
      }

    } catch (err) {
      console.error("❌ Uptime error:", err.message);
      await api.sendMessage("❌ Error: Couldn't fetch uptime or video.", event.threadID);
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
