const { getTime, drive } = global.utils;

const VIDEOS = [
  "17tGvbWdcxgUKAWDN0Zk151XL3XmI3i-k",
  "18STu2xcXSi-SP8utpDdSpOyA7EJEYcU9",
  "18SGdkknAOIdxDeJkyOg22MwYLUa9HKyB",
  "18Na0G97r8lTh2ShHn4VXi7ufv_1etIzp",
  "18J3EFEwCye1_204hyeg48_3Gg0j26niC",
  "18HkjnCElht-QJQTFaWs2MmTwhA1wj9Xy",
  "18AhLAh9jdC45zTv9r8o9GdMhuuEzH2zD",
  "180c6lHeD3f0x6fCC9aTeouekachDt8xQ"
];

module.exports = {
  config: {
    name: "leave",
    version: "2.2",
    author: "Rahad",
    category: "events"
  },

  async run({ event, api, usersData, threadsData }) {
    const { logMessageType, leftParticipantFbId, threadID } = event;
    if (logMessageType !== "log:unsubscribe") return;

    const threadData = await threadsData.get(threadID);
    const userName = await usersData.getName(leftParticipantFbId);
    const session = getTime("session");
    const time = getTime("time");
    const threadName = threadData.threadName || "this group";

    const leaveText = `
╭━━━🚨 𝐋𝐄𝐀𝐕𝐄 𝐀𝐋𝐄𝐑𝐓 🚨━━━╮
┃ 🧛‍♂️ 𝗨𝘀𝗲𝗿: ⟪ @${userName} ⟫
┃ 🚪 𝗟𝗲𝗳𝘁 𝗦𝘁𝗮𝘁𝘂𝘀: ⟪ Left the group ⟫
┃ ⏰ 𝗧𝗶𝗺𝗲: ⟪ ${time}:00 • ${session} ⟫
┃ 🏡 𝗚𝗿𝗼𝘂𝗽: ⟪ ${threadName} ⟫
┃
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ❌ 𝗘𝗫𝗜𝗧 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗! 𝗨𝗻𝗮𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗲𝗱 𝗲𝘅𝗶𝘁...
┃ 🛰️ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗮𝗹𝗲𝗿𝘁 𝘁𝗿𝗶𝗴𝗴𝗲𝗿𝗲𝗱!
┃
╰━━━🔒 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬: 𝗔𝗖𝗧𝗜𝗩𝗘 🔒━━━╯`;

    const videoStream = await drive.getFile(
      VIDEOS[Math.floor(Math.random() * VIDEOS.length)]
    );

    return api.sendMessage({
      body: leaveText,
      attachment: videoStream,
      mentions: [{ tag: `@${userName}`, id: leftParticipantFbId }]
    }, threadID);
  },

  onStart() {
    // Prevents event loading error
  }
};
