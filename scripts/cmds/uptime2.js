const os = require('os');
const util = require('util');
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const exec = util.promisify(require('child_process').exec);

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["up2", "stats"],
    version: "2.0",
    author: "BaYjid + Rahad Edit",
    role: 0,
    category: "system",
    guide: { en: "Use {p}uptime2" }
  },

  onStart: async function ({ message, event, api }) {
    try {
      const uptime = process.uptime();
      const formattedUptime = formatUptimeFull(uptime);

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      const diskUsage = await getDiskUsageSafe();

      const systemInfo = {
        os: `${os.type()} ${os.release()}`,
        arch: os.arch(),
        cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
        loadAvg: os.loadavg()[0].toFixed(2),
        botUptime: formattedUptime,
        systemUptime: formatUptime(os.uptime()),
        processMemory: prettyBytes(process.memoryUsage().rss)
      };

      const response =
`╔═━[ 🔰 𝗦𝗬𝗦𝗧𝗘𝗠 𝗢𝗩𝗘𝗥𝗩𝗜𝗘𝗪 ]━═╗

[ 🖥 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 ]
• OS     : ${systemInfo.os}
• Arch   : ${systemInfo.arch}
• CPU    : ${systemInfo.cpu}
• Load   : ${systemInfo.loadAvg}

[ 🧠 𝗠𝗘𝗠𝗢𝗥𝗬 ]
• Usage  : ${prettyBytes(usedMemory)} / ${prettyBytes(totalMemory)}
• RAM    : ${prettyBytes(usedMemory)}

[ 💾 𝗗𝗜𝗦𝗞 ]
• Used   : ${diskUsage}

[ ⏱ 𝗨𝗣𝗧𝗜𝗠𝗘 ]
• Bot    : ${systemInfo.botUptime}
• Server : ${systemInfo.systemUptime}

[ ⚙️ 𝗣𝗥𝗢𝗖𝗘𝗦𝗦 ]
• Memory : ${systemInfo.processMemory}

╚═━[ 🔥𝗕𝗢𝗧 ✦ 𝗥𝗮𝗛𝗔𝗗 ]━═╝`;

      // Video IDs
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

      const selected = videoIDs[Math.floor(Math.random() * videoIDs.length)];
      const videoUrl = `https://drive.google.com/uc?export=download&id=${selected}`;
      const filePath = path.join(__dirname, "cache", `uptime2_${Date.now()}.mp4`);

      try {
        const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
        fs.ensureDirSync(path.dirname(filePath));
        fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

        await api.sendMessage({
          body: response,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      } catch (videoErr) {
        console.error("Video failed:", videoErr.message);
        message.reply(`${response}\n⚠️ But video could not be loaded.`);
      }

    } catch (err) {
      console.error("❌ Uptime2 error:", err.message);
      message.reply("❌ Couldn't fetch system stats or video.");
    }
  }
};

// Utility Functions

async function getDiskUsageSafe() {
  try {
    const { stdout } = await exec('df -k /');
    const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
    const percent = ((parseInt(used) / parseInt(total)) * 100).toFixed(1);
    return `${prettyBytes(parseInt(used) * 1024)} / ${prettyBytes(parseInt(total) * 1024)} (${percent}%)`;
  } catch (e) {
    return "Disk info unavailable";
  }
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function formatUptimeFull(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}
