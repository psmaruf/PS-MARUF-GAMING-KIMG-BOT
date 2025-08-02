let isTimerRunning = false;
let intervalID = null;
let lastSentTime = null;

const videoLinks = [
  "https://drive.google.com/uc?export=download&id=19xGnVk43vdYrm-z45xDeTpn9MQOqfcMm",
  "https://drive.google.com/uc?export=download&id=1AJ_eVwWX_xVRJRlBNLbtQzyRLCBR5aNG",
  "https://drive.google.com/uc?export=download&id=1ABGLFKV2EjKtMc1xMombfaaKrvV1HDMx",
  "https://drive.google.com/uc?export=download&id=1A2532UPoppgFPuZns9VgQVp0oZWPbIK6",
  "https://drive.google.com/uc?export=download&id=19y1urBiBel1jgRPM8VXub1_lRd57BTTb",
  "https://drive.google.com/uc?export=download&id=19y-dILbf6W6Mk5jBfhomMRM1sgel0np0",
  "https://drive.google.com/uc?export=download&id=19xW0cHhdDugtlHClIoJToy6zwo807IiS"
];

const timerData = {
  "01:00:00 AM": { message: "🕐 〘 𝟏𝐀𝐌 〙— 𝙉𝙞𝙜𝙝𝙩 𝙤𝙬𝙡 𝙙𝙚𝙩𝙚𝙘𝙩𝙚𝙙! 🦉" },
  "02:00:00 AM": { message: "🕑 〘 𝟐𝐀𝐌 〙— 𝑳𝒂𝒕𝒆 𝒏𝒊𝒈𝒉𝒕 𝒄𝒐𝒅𝒆𝒓? 💻" },
  "03:00:00 AM": { message: "🕒 〘 𝟑𝐀𝐌 〙— 𝘚𝘭𝘦𝘦𝘱 𝘪𝘴 𝘪𝘮𝘱𝘰𝘳𝘵𝘢𝘯𝘵 😴" },
  "04:00:00 AM": { message: "🕓 〘 𝟒𝐀𝐌 〙— 𝐘𝐨𝐮 𝐮𝐩? 🌙" },
  "05:00:00 AM": { message: "🕔 〘 𝟓𝐀𝐌 〙— 𝑨𝒍𝒎𝒐𝒔𝒕 𝒔𝒖𝒏𝒓𝒊𝒔𝒆 🌅" },
  "06:00:00 AM": { message: "🌄 〘 𝙂𝙤𝙤𝙙 𝙈𝙤𝙧𝙣𝙞𝙣𝙜! 〙✨\n𝑹𝒊𝒔𝒆 𝒂𝒏𝒅 𝒔𝒉𝒊𝒏𝒆! 🔔" },
  "07:00:00 AM": { message: "🕖 〘 𝟳𝐀𝐌 〙— 𝑹𝒆𝒂𝒅𝒚 𝒕𝒐 𝒈𝒓𝒊𝒏𝒅? ⚡" },
  "08:00:00 AM": { message: "🕗 〘 𝟖𝐀𝐌 〙— 𝑮𝒓𝒂𝒃 𝒃𝒓𝒆𝒂𝒌𝒇𝒂𝒔𝒕! 🥞" },
  "09:00:00 AM": { message: "🕘 〘 𝟗𝐀𝐌 〙— 𝑾𝒐𝒓𝒌 𝒎𝒐𝒅𝒆 𝑶𝑵 💼" },
  "10:00:00 AM": { message: "🕙 〘 𝟏𝟎𝐀𝐌 〙— 𝑭𝒐𝒄𝒖𝒔 𝒉𝒐𝒖𝒓 🧠" },
  "11:00:00 AM": { message: "🕚 〘 𝟏𝟏𝐀𝐌 〙— 𝑲𝒆𝒆𝒑 𝒈𝒐𝒊𝒏𝒈! 🚀" },
  "12:00:00 PM": { message: "🍱 〘 𝑳𝒖𝒏𝒄𝒉 𝑻𝒊𝒎𝒆! 〙😋\n𝑻𝒊𝒎𝒆 𝒕𝒐 𝒓𝒆𝒇𝒖𝒆𝒍 🔋" },
  "01:00:00 PM": { message: "🕐 〘 𝟏𝐏𝐌 〙— 𝑩𝒂𝒄𝒌 𝒕𝒐 𝒉𝒖𝒔𝒕𝒍𝒆 💪" },
  "02:00:00 PM": { message: "🕑 〘 𝟐𝐏𝐌 〙— 𝑷𝒐𝒘𝒆𝒓 𝒕𝒉𝒓𝒐𝒖𝒈𝒉 🔥" },
  "03:00:00 PM": { message: "☕ 〘 𝘼𝙛𝙩𝙚𝙧𝙣𝙤𝙤𝙣 𝙍𝙚𝙢𝙞𝙣𝙙𝙚𝙧 〙💦\n𝑯𝒚𝒅𝒓𝒂𝒕𝒆 & 𝒔𝒕𝒂𝒚 𝒇𝒐𝒄𝒖𝒔𝒆𝒅 🧠" },
  "04:00:00 PM": { message: "🕓 〘 𝟒𝐏𝐌 〙— 𝑺𝒕𝒓𝒆𝒕𝒄𝒉 𝒂 𝒃𝒊𝒕 🧘" },
  "05:00:00 PM": { message: "🕔 〘 𝟓𝐏𝐌 〙— 𝑾𝒓𝒂𝒑𝒑𝒊𝒏𝒈 𝒖𝒑 𝒔𝒐𝒐𝒏! 🎯" },
  "06:00:00 PM": { message: "🕕 〘 𝟔𝐏𝐌 〙— 𝑬𝒗𝒆𝒏𝒊𝒏𝒈 𝒃𝒆𝒈𝒊𝒏𝒔 🌆" },
  "07:00:00 PM": { message: "🌇 〘 𝙀𝙫𝙚𝙣𝙞𝙣𝙜 𝙈𝙤𝙤𝙙 〙🎧\n𝑺𝒆𝒕𝒕𝒍𝒆 𝒅𝒐𝒘𝒏, 𝒆𝒏𝒋𝒐𝒚 𝒕𝒉𝒆 𝒗𝒊𝒃𝒆𝒔 ✨" },
  "08:00:00 PM": { message: "🕗 〘 𝟖𝐏𝐌 〙— 𝑹𝒆𝒍𝒂𝒙 𝒎𝒐𝒅𝒆 💆" },
  "09:00:00 PM": { message: "🌙 〘 𝙉𝙞𝙜𝙝𝙩 𝙁𝙚𝙚𝙡𝙨 〙💤\n𝑺𝒕𝒂𝒓𝒔 𝒂𝒓𝒆 𝒔𝒉𝒊𝒏𝒊𝒏𝒈... ✨" },
  "10:00:00 PM": { message: "🕙 〘 𝟏𝟎𝐏𝐌 〙— 𝑼𝒏𝒘𝒊𝒏𝒅 & 𝒃𝒓𝒆𝒂𝒕𝒉𝒆 🌬️" },
  "11:00:00 PM": { message: "🌌 〘 𝙂𝙤𝙤𝙙𝙣𝙞𝙜𝙝𝙩 𝙎𝙞𝙜𝙣 𝙊𝙛𝙛 〙😴\n𝑺𝒘𝒆𝒆𝒕 𝒅𝒓𝒆𝒂𝒎𝒔! 🌠" },
  "12:00:00 AM": { message: "🕛 〘 𝙈𝙞𝙙𝙣𝙞𝙜𝙝𝙩 〙— 𝑺𝒍𝒆𝒆𝒑 𝒕𝒊𝒈𝒉𝒕 🌚" }
};

function getCurrentTime() {
  return new Date(Date.now() + 21600000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).trim();
}

function getRandomVideo() {
  const index = Math.floor(Math.random() * videoLinks.length);
  return videoLinks[index];
}

function runTimer(api) {
  if (intervalID) return;
  intervalID = setInterval(async () => {
    try {
      const now = getCurrentTime();
      if (now !== lastSentTime && timerData[now]) {
        lastSentTime = now;
        const threads = global.GoatBot.config?.whiteListModeThread?.whiteListThreadIds || [];
        const videoUrl = getRandomVideo();
        const messageText = `╭───────────────⏰\n│  ${timerData[now].message}\n╰───────────────🕒 ${now}`;
        for (const threadID of threads) {
          await api.sendMessage({
            body: messageText,
            attachment: await global.utils.getStreamFromURL(videoUrl)
          }, threadID);
        }
      }
    } catch (e) {
      console.error("AutoTimer Error:", e);
    }
  }, 1000);
}

function start(api) {
  if (isTimerRunning) return;
  isTimerRunning = true;
  runTimer(api);
}

function stop() {
  if (intervalID) clearInterval(intervalID);
  isTimerRunning = false;
  intervalID = null;
  lastSentTime = null;
}

module.exports = {
  config: {
    name: "autotimer",
    version: "3.0",
    author: "Dipto + ChatGPT",
    role: 0,
    shortDescription: "⏰ প্রতি ঘন্টায় Text effect সহ মেসেজ + র‍্যান্ডম ভিডিও পাঠাবে",
    category: "utility",
    guide: {
      en: "/autotimer on\n/autotimer off\n/autotimer status"
    }
  },

  onStart: async ({ api }) => {
    start(api);
  },

  run: async ({ api, event, args }) => {
    const cmd = args[0];
    if (cmd === "on") {
      if (isTimerRunning) return api.sendMessage("⏳ Timer already running.", event.threadID);
      start(api);
      return api.sendMessage("✅ AutoTimer started.", event.threadID);
    }
    if (cmd === "off") {
      if (!isTimerRunning) return api.sendMessage("❌ Timer is not running.", event.threadID);
      stop();
      return api.sendMessage("🛑 AutoTimer stopped.", event.threadID);
    }
    if (cmd === "status") {
      return api.sendMessage(`📊 AutoTimer status: ${isTimerRunning ? "Running ✅" : "Stopped ❌"}`, event.threadID);
    }
    return api.sendMessage("📘 Usage:\n/autotimer on\n/autotimer off\n/autotimer status", event.threadID);
  }
};
