const axios = require("axios");

module.exports = {
  config: {
    name: "info",
    aliases: ["owner", "dev", "creator"],
    version: "2.6",
    author: "BaYjid",
    role: 0,
    shortDescription: { en: "Rahad Bot info with upgraded stylish design" },
    longDescription: { en: "Shows Rahad Bot uptime, ping, group info & sends a video with stylish grid design." },
    category: "Info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const startTime = globalThis.__startTime || (globalThis.__startTime = Date.now());
    const uptimeMs = Date.now() - startTime;
    const hours = Math.floor(uptimeMs / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);
    const seconds = Math.floor((uptimeMs % 60000) / 1000);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    const pingStart = Date.now();
    await new Promise(res => setTimeout(res, 40));
    const ping = Date.now() - pingStart;

    const threadInfo = await api.getThreadInfo(event.threadID);
    const groupName = threadInfo.threadName || "Unnamed Group";
    const groupID = event.threadID;
    const memberCount = threadInfo.participantIDs.length;
    const adminCount = threadInfo.adminIDs.length;
    const messageCount = threadInfo.messageCount || "N/A";

    let male = 0, female = 0;
    try {
      const allUserInfo = await api.getUserInfo(threadInfo.participantIDs);
      for (const id in allUserInfo) {
        const gender = allUserInfo[id]?.gender?.toLowerCase();
        if (gender === "male") male++;
        else if (gender === "female") female++;
      }
    } catch (err) {
      console.error("Gender count failed:", err.message);
    }

    const msg = `
╔═━「 🧠 𝙍𝘼𝙃𝘼𝘿 𝘽𝙊𝙏 𝙎𝙔𝙎𝙏𝙀𝙈 」━═╗

🛰️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦:
╭───────────────╮
│⏱️ 𝗨𝗣𝗧𝗜𝗠𝗘 : 𝘽𝙤𝙩 𝙊𝙣𝙡𝙞𝙣𝙚 𝙛𝙤𝙧 ${uptime}
│📶 𝗣𝗜𝗡𝗚    : ${ping}ms 🚀
╰───────────────╯

🧑‍💻 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢:
╭────────────────────╮
│👤 𝗡𝗔𝗠𝗘     : 𝙁𝘼𝙏𝙃𝙀𝙍 𝙍𝘼𝙃𝘼𝘿 🐉
│📞 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 : +91 80160 42533
╰────────────────────╯

👥 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢:
╭────────────────────────────╮
│🏷️ 𝗡𝗔𝗠𝗘      : ${groupName}
│🆔 𝗜𝗗         : ${groupID}
│👪 𝗠𝗘𝗠𝗕𝗘𝗥𝗦  : ${memberCount} 👤 | 𝗔𝗗𝗠𝗜𝗡𝗦 👑 : ${adminCount}
│🚹 𝗠𝗔𝗟𝗘      : ${male} | 🚺 𝗙𝗘𝗠𝗔𝗟𝗘 : ${female}
╰────────────────────────────╯

📜 『 𝙈𝙊𝙏𝙏𝙊 : ✨ 𝘽𝙪𝙞𝙡𝙙. 𝙃𝙖𝙘𝙠. 𝙍𝙚𝙥𝙚𝙖𝙩. ✨ 』`;

    const videoIDs = [
      "10QycYgsTagrN90cWJCIWWVwmps2kk_oF", "10BQjmmp2isPM47CtEZVhYySDQ1lSiCjW",
      "10aeHJzXq0kJIGdh9E7lfUKYD0oHqz2o3", "10Ke-d2H4yhGpwwAgRt0HmFV8lRB-QJ2J",
      "10Jb5FGt600rNrJgr-XeTfZsCSjknJep1", "10CDv_le5rdnOYXF3Kp6bnvTSyWvuwHFb",
      "11SODMThWq7QXQH6UfIexQwXID5rwndrO", "11yApwtKdKmL5T9_VO42HrBqgmEpcieRD",
      "11sWbYHxAQmVFB9p1-Yj1Kjdn3y4b2q4u", "11sCEjK2gZ6eylftpVqc4V2W9wpYid3ss",
      "11r9nJpCAx96pP5upIdK3eCybBqo_e3a0", "11qmi8ceB-q-aFZGxhL65FIdV_Kj-gMad",
      "11hXIudeOKWRO9BTFpta6s5FyFjt9ULye", "11aIU0gfmMuRjoUTkgp20ZOllMNF7ybaA",
      "11WC7f3brQzVpDQtY9yZa_IK6tKDggTrg"
    ];
    const selectedID = videoIDs[Math.floor(Math.random() * videoIDs.length)];
    const videoURL = `https://drive.google.com/uc?export=download&id=${selectedID}`;

    try {
      const videoStream = await axios({ method: "GET", url: videoURL, responseType: "stream" });
      return api.sendMessage({ body: msg, attachment: videoStream.data }, event.threadID);
    } catch (err) {
      console.error("Video failed:", err.message);
      return api.sendMessage(msg + "\n⚠️ Video load failed.", event.threadID);
    }
  }
};
