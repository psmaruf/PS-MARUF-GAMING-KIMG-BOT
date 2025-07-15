const axios = require("axios");

module.exports = {
  config: {
    name: "info",
    aliases: ["owner", "dev", "creator"],
    version: "2.2",
    author: "BaYjid",
    role: 0,
    shortDescription: { en: "Rahad Bot info with video" },
    longDescription: { en: "Shows Rahad Bot uptime, ping, group info & sends a video." },
    category: "Info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    // ⏱️ UPTIME
    const startTime = globalThis.__startTime || Date.now();
    globalThis.__startTime = startTime;
    const uptimeMs = Date.now() - startTime;
    const hours = Math.floor(uptimeMs / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);
    const seconds = Math.floor((uptimeMs % 60000) / 1000);
    const uptime = `${hours}hrs ${minutes}min ${seconds}sec`;

    // 📶 PING
    const pingStart = Date.now();
    await new Promise(res => setTimeout(res, 40));
    const ping = Date.now() - pingStart;

    // 🧑‍🤝‍🧑 GROUP INFO
    const threadInfo = await api.getThreadInfo(event.threadID);
    const groupName = threadInfo.threadName || "Unnamed Group";
    const groupID = event.threadID;
    const memberCount = threadInfo.participantIDs.length;
    const adminCount = threadInfo.adminIDs.length;

    let male = 0, female = 0;
    for (const id of threadInfo.participantIDs) {
      const info = await api.getUserInfo(id);
      const gender = info[id]?.gender;
      if (gender === 'MALE') male++;
      else if (gender === 'FEMALE') female++;
    }

    // 🌐✨ Final Message Text
    const msg = 
`🌐✨ 𝙍𝘼𝙃𝘼𝘿 𝘽𝙊𝙏'𝙎 𝙄𝙉𝙁𝙊... ✨🌐

┏━━━━━━━ 🧠 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ━━━━━━━┓
┃⏱️ 𝗨𝗣𝗧𝗜𝗠𝗘   : ${uptime}
┃📶 𝗣𝗜𝗡𝗚     : ${ping}ms
┃🛠️ 𝗕𝗢𝗧     : 𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 🔥
┃🔧 𝗩𝗘𝗥𝗦𝗜𝗢𝗡 : 4.5.2
┃👨‍💻 𝗢𝗪𝗡𝗘𝗥   : 𝙍𝙖𝙝𝙖𝙙 (Itadori Yuji)
┃📍 𝗙𝗥𝗢𝗠     : 🇧🇩 Bangladesh
┃📞 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 : +8801734822042
┗━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━ 🧑‍🤝‍🧑 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢 ━━━━━━━━┓
┃📛 𝗡𝗔𝗠𝗘     : ${groupName}
┃🆔 𝗜𝗗        : ${groupID}
┃👥 𝗠𝗘𝗠𝗕𝗘𝗥𝗦   : ${memberCount}
┃🚹 𝗠𝗔𝗟𝗘     : ${male}   🚺 𝗙𝗘𝗠𝗔𝗟𝗘 : ${female}
┃🛡️ 𝗔𝗗𝗠𝗜𝗡𝗦   : ${adminCount}
┃💬 𝗠𝗘𝗦𝗦𝗔𝗚𝗘𝗦 : ${threadInfo.messageCount || "N/A"}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🔮 𝗠𝗢𝗧𝗧𝗢: "𝗖𝗼𝗱𝗲 𝗪𝗶𝘁𝗵 𝗛𝗼𝗻𝗼𝗿, 𝗙𝗶𝗴𝗵𝘁 𝗪𝗶𝘁𝗵 𝗛𝗲𝗮𝗿𝘁"
🔥 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 : 𝐗𝐀𝐒𝐒 𝐑𝐀𝐇𝐀𝐃 𝐁𝐎𝐓 🔥`;

    // 🎥 VIDEO LIST (15 total)
    const videoIDs = [
      "10QycYgsTagrN90cWJCIWWVwmps2kk_oF",
      "10BQjmmp2isPM47CtEZVhYySDQ1lSiCjW",
      "10aeHJzXq0kJIGdh9E7lfUKYD0oHqz2o3",
      "10Ke-d2H4yhGpwwAgRt0HmFV8lRB-QJ2J",
      "10Jb5FGt600rNrJgr-XeTfZsCSjknJep1",
      "10CDv_le5rdnOYXF3Kp6bnvTSyWvuwHFb",
      "11SODMThWq7QXQH6UfIexQwXID5rwndrO",
      "11yApwtKdKmL5T9_VO42HrBqgmEpcieRD",
      "11sWbYHxAQmVFB9p1-Yj1Kjdn3y4b2q4u",
      "11sCEjK2gZ6eylftpVqc4V2W9wpYid3ss",
      "11r9nJpCAx96pP5upIdK3eCybBqo_e3a0",
      "11qmi8ceB-q-aFZGxhL65FIdV_Kj-gMad",
      "11hXIudeOKWRO9BTFpta6s5FyFjt9ULye",
      "11aIU0gfmMuRjoUTkgp20ZOllMNF7ybaA",
      "11WC7f3brQzVpDQtY9yZa_IK6tKDggTrg"
    ];
    const selectedID = videoIDs[Math.floor(Math.random() * videoIDs.length)];
    const videoURL = `https://drive.google.com/uc?export=download&id=${selectedID}`;

    // 📤 SEND MESSAGE
    try {
      const videoStream = await axios({ method: "GET", url: videoURL, responseType: "stream" });
      return api.sendMessage({ body: msg, attachment: videoStream.data }, event.threadID);
    } catch (err) {
      console.error("❌ Video failed:", err.message);
      return api.sendMessage(msg + "\n⚠️ Could not load video.", event.threadID);
    }
  }
};
