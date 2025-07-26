const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "2.0",
    author: "Rahad",
    category: "events"
  },

  // 💀 Custom Leave Message 💀
  defaultLeaveMessage: `
╔══════════ 💀 𝐋𝐄𝐀𝐕𝐄 𝐀𝐋𝐄𝐑𝐓 💀 ══════════╗

👤 𝗨𝘀𝗲𝗿: 『 {userNameTag} 』
📤 𝗦𝘁𝗮𝘁𝘂𝘀: 『 {type} 』
🕒 𝗧𝗶𝗺𝗲: 『 {time}:00 • {session} 』
🏠 𝗚𝗿𝗼𝘂𝗽: 『 {threadName} 』

⚠️ 𝗔 𝗺𝗲𝗺𝗯𝗲𝗿 𝗵𝗮𝘀 𝗲𝘅𝗶𝘁𝗲𝗱 𝘁𝗵𝗲 𝗰𝗼𝗿𝗲...

╚════════════════════════════════╝
🔐 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗦𝗬𝗦𝗧𝗘𝗠: ★ 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 ★`,

  videoList: [
    "18AhLAh9jdC45zTv9r8o9GdMhuuEzH2zD",
    "180c6lHeD3f0x6fCC9aTeouekachDt8xQ",
    "177hZ758fhPfSmTMTXs4MFX2tMsyk_q__",
    "17FglmV8XgzNCXFmhoOwAGamYGUQdt3yL",
    "17JmAJ9qe6yIMDVFII_wc2soOa",
    "16h6cEFYYHqjNAuVsyVhJfoCg_1SBOO82",
    "16Xu5T2RpboZs4Nv-F0T_tIWlqjv074Vd",
    "102gwON0U1r2heO9iM3K4J3E0TTN_cnvF"
  ],

  async onEvent({ event, api, threadsData, usersData }) {
    const { threadID, logMessageData, logMessageType } = event;
    if (logMessageType !== "log:unsubscribe") return;

    const threadInfo = await threadsData.get(threadID);
    if (threadInfo?.settings?.leave === false) return;

    const leftID = logMessageData.leftParticipantFbId;
    const leftName = await usersData.getName(leftID);
    const type = leftID === event.author ? "Left voluntarily" : "Kicked out";
    const time = getTime("HH");
    const session =
      time < 5 ? "Night" :
      time < 12 ? "Morning" :
      time < 18 ? "Afternoon" : "Evening";

    const msg = this.defaultLeaveMessage
      .replace("{userNameTag}", leftName)
      .replace("{type}", type)
      .replace("{time}", time)
      .replace("{session}", session)
      .replace("{threadName}", threadInfo.threadName || "Group");

    // 📎 Send Random Video
    const randomID = this.videoList[Math.floor(Math.random() * this.videoList.length)];
    const videoPath = await drive.getFile(randomID, "leaveVideo.mp4");

    api.sendMessage({
      body: msg,
      attachment: videoPath ? [videoPath] : null
    }, threadID);
  }
};
