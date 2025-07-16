module.exports.config = {
  name: "autotimer",
  version: "4.0",
  role: 0,
  author: "Bayjid x ChatGPT",
  description: "Send hourly messages with stylish text and different videos (BD Time)",
  category: "AutoTime",
  countDown: 5,
};

const videoMap = {
  0: "13opJkICUIzLTSFCjZg3ksIRqRR6530QH",
  1: "13y1WQ1SgDexQmCOhUrWd9VWZutKyOmM2",
  2: "13yp6fQ67gb0GgnJXRGCfbW9C-9pY1cR8",
  3: "142JD_gs1B-FZf4mk4opw-UylES01-4yc",
  4: "13oTsTt9vhWp1UGNuZYsDnVlMo85Wx50D"
  // Add more hours with corresponding video IDs
};

module.exports.onLoad = async ({ api }) => {
  const templates = {
    all: `
┏━━━━━━━━━━━━━━━💫━━━━━━━━━━━━━━━┓
┃ 🕰️ 𝙏𝙞𝙢𝙚: 〔 {TIME} 〕
┃ 💬 𝙂𝙧𝙤𝙪𝙥: {GROUP}
┃ ✨ {GREETING}
┃ 💡 𝙏𝙞𝙥: 𝙎𝙩𝙖𝙮 𝙥𝙤𝙨𝙞𝙩𝙞𝙫𝙚, 𝙨𝙩𝙖𝙮 𝙛𝙤𝙘𝙪𝙨𝙚𝙙!
┗━━━━━━━━━━━━━━━🌙━━━━━━━━━━━━━━━┛
🎯 🚀 🔥 𝑪𝒐𝒏𝒒𝒖𝒆𝒓 𝒚𝒐𝒖𝒓 𝒉𝒐𝒖𝒓!
`,
  };

  const greetingForHour = (h) => {
    if (h >= 0 && h < 5)
      return "🌌 𝑴𝒊𝒅𝒏𝒊𝒈𝒉𝒕 𝑺𝒆𝒓𝒆𝒏𝒊𝒕𝒚 ~ 𝑻𝒊𝒎𝒆 𝒕𝒐 𝒓𝒆𝒔𝒕 💭🛌";
    if (h >= 5 && h < 8)
      return "🌄 𝑹𝒊𝒔𝒆 & 𝑺𝒉𝒊𝒏𝒆! 𝑨 𝒏𝒆𝒘 𝒅𝒂𝒚 𝒃𝒆𝒈𝒊𝒏𝒔 ✨☕";
    if (h >= 8 && h < 12)
      return "🌞 𝑮𝒐𝒐𝒅 𝑴𝒐𝒓𝒏𝒊𝒏𝒈! 𝑺𝒕𝒂𝒚 𝒑𝒓𝒐𝒅𝒖𝒄𝒕𝒊𝒗𝒆 🚀📚";
    if (h >= 12 && h < 14)
      return "🌤️ 𝑰𝒕'𝒔 𝑴𝒊𝒅𝒅𝒂𝒚! 𝑲𝒆𝒆𝒑 𝒈𝒐𝒊𝒏𝒈 💪🍱";
    if (h >= 14 && h < 17)
      return "🌼 𝑨𝒇𝒕𝒆𝒓𝒏𝒐𝒐𝒏 𝑭𝒐𝒄𝒖𝒔 𝑴𝒐𝒅𝒆 𝑶𝑵 🎯📈";
    if (h >= 17 && h < 19)
      return "🌇 𝑬𝒗𝒆𝒏𝒊𝒏𝒈 𝑮𝒍𝒐𝒘 𝑻𝒊𝒎𝒆! 𝑹𝒆𝒍𝒂𝒙 & 𝑹𝒆𝒔𝒆𝒕 🌿📖";
    if (h >= 19 && h < 22)
      return "🌃 𝑷𝒆𝒂𝒄𝒆𝒇𝒖𝒍 𝑵𝒊𝒈𝒉𝒕𝒇𝒂𝒍𝒍 ~ 𝑺𝒕𝒂𝒚 𝒄𝒂𝒍𝒎 😌🌙";
    return "🌙 𝑳𝒂𝒕𝒆 𝑵𝒊𝒈𝒉𝒕 𝑴𝒐𝒅𝒆. 𝑺𝒘𝒆𝒆𝒕 𝒅𝒓𝒆𝒂𝒎𝒔 🛌⭐";
  };

  const getVideoStream = async (id) => {
    const url = `https://drive.google.com/uc?export=download&id=${id}`;
    try {
      return await global.utils.getStreamFromURL(url);
    } catch (e) {
      console.error("❌ Video fetch failed:", e.message);
      return null;
    }
  };

  const checkAndSend = async () => {
    const now = new Date(Date.now() + 21600000);
    const hour = now.getHours();
    const timeStr = now.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const boxedTime = `【 ${timeStr} 】`;
    const greeting = greetingForHour(hour);
    const threads = global.GoatBot.config.whiteListModeThread?.whiteListThreadIds || [];
    const attachment = videoMap[hour] ? await getVideoStream(videoMap[hour]) : null;

    for (const threadID of threads) {
      try {
        const info = await api.getThreadInfo(threadID);
        const groupName = info.threadName || "Group";
        const msg = templates.all
          .replace("{TIME}", boxedTime)
          .replace("{GROUP}", groupName)
          .replace("{GREETING}", greeting);
        await api.sendMessage({ body: msg, attachment }, threadID);
      } catch (err) {
        console.error(`❌ Failed to send to ${threadID}:`, err.message);
      }
    }

    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(hour + 1);
    setTimeout(checkAndSend, nextHour - now);
  };

  checkAndSend();
};

module.exports.onStart = () => {}; 
