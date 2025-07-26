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
    version: "2.3",
    author: "Rahad",
    category: "events"
  },

  async run({ event, api, usersData, threadsData }) {
    const { logMessageType, leftParticipantFbId, threadID } = event;
    if (logMessageType !== "log:unsubscribe") return;

    // Debug
    console.log("Leave event triggered for FBID:", leftParticipantFbId);

    const threadData = await threadsData.get(threadID).catch(err => {
      console.error("Error getting thread data:", err);
      return {};
    });
    const threadName = threadData?.threadName || "this group";

    // Get user name with fallback
    let userName = "Unknown User";
    try {
      userName = await usersData.getName(leftParticipantFbId) || userName;
    } catch (e) {
      console.error("Error fetching user name:", e);
    }

    const session = getTime("session");
    const time = getTime("time");

    const leaveText = `
╭━━━🚨 𝐋𝐄𝐀𝐕𝐄 𝐀𝐋𝐄𝐑𝐓 🚨━━━╮
┃ 🧛‍♂️ 𝗨𝘀𝗲𝗿: ⟪ @${userName} ⟫
┃ 🚪 𝗟𝗲𝗳𝘁 𝗦𝘁𝗮𝘁𝘂𝘀: ⟪ Left the group ⟫
┃ ⏰ 𝗧𝗶𝗺𝗲: ⟪ ${time}:00 • ${session} ⟫
┃ 🏡 𝗚𝗿𝗼𝘂𝗽: ⟪ ${threadName} ⟫
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ❌ 𝗘𝗫𝗜𝗧 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗! Unauthorized exit...
┃ 🛰️ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗮𝗹𝗲𝗿𝘁 𝘁𝗿𝗶𝗴𝗴𝗲𝗿𝗲𝗱!
╰━━━🔒 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬: 𝗔𝗖𝗧𝗜𝗩𝗘 🔒━━━╯`;

    // Try to load video
    let videoStream = null;
    try {
      const randomId = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
      videoStream = await drive.getFile(randomId);
    } catch (err) {
      console.error("Failed to load video attachment:", err);
    }

    // Build message payload
    const messagePayload = {
      body: leaveText,
      mentions: [{ tag: `@${userName}`, id: leftParticipantFbId }]
    };
    if (videoStream) {
      messagePayload.attachment = videoStream;
    }

    return api.sendMessage(messagePayload, threadID)
      .catch(err => console.error("Error sending leave message:", err));
  },

  onStart() {
    console.log("Leave event module started successfully.");
  }
};
