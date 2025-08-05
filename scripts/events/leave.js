const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "1.6",
    author: "Rahad",
    category: "events"
  },

  langs: {
    en: {
      session1: "🌅 𝙼𝚘𝚛𝚗𝚒𝚗𝚐",
      session2: "🍱 𝙽𝚘𝚘𝚗",
      session3: "🌇 𝙰𝚏𝚝𝚎𝚛𝚗𝚘𝚘𝚗",
      session4: "🌃 𝙴𝚟𝚎𝚗𝚒𝚗𝚐",
      leaveType1: "🚪 𝗟𝗲𝗳𝘁",
      leaveType2: "🛑 𝘄𝗮𝘀 𝗸𝗶𝗰𝗸𝗲𝗱 𝗳𝗿𝗼𝗺",
      defaultLeaveMessage:
`╭━━━[ 👋 𝗠𝗘𝗠𝗕𝗘𝗥 𝗟𝗘𝗙𝗧 ]━━━╮
┃ 👤 𝗡𝗮𝗺𝗲: {userNameTag}
┃ 📤 𝗦𝘁𝗮𝘁𝘂𝘀: {type} the group
┃ 🕒 𝗧𝗶𝗺𝗲: {time}h - {session}
┃ 💬 𝗚𝗿𝗼𝘂𝗽: {threadName}
╰━━━━━━━━━━━━━━━━━━━━━━╯`
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId === api.getCurrentUserID()) return;

    const hours = parseInt(getTime("HH"));
    const threadName = threadData.threadName || "this group";
    const userName = await usersData.getName(leftParticipantFbId) || "Unknown User";

    let leaveMessage = threadData.data.leaveMessage || getLang("defaultLeaveMessage");

    const session =
      hours <= 10 ? getLang("session1") :
      hours <= 12 ? getLang("session2") :
      hours <= 18 ? getLang("session3") :
      getLang("session4");

    // Prepare form with placeholders replaced
    const form = {
      body: leaveMessage
        .replace(/\{userNameTag\}/g, `@${userName}`)
        .replace(/\{userName\}/g, userName)
        .replace(/\{type\}/g, leftParticipantFbId === event.author ? getLang("leaveType1") : getLang("leaveType2"))
        .replace(/\{threadName\}|\{boxName\}/g, threadName)
        .replace(/\{time\}/g, hours)
        .replace(/\{session\}/g, session)
    };

    // Add mention if {userNameTag} was used
    if (leaveMessage.includes("{userNameTag}")) {
      form.mentions = [{
        id: leftParticipantFbId,
        tag: userName
      }];
    }

    // List of leave video file IDs
    const leaveVideos = [
      "17tGvbWdcxgUKAWDN0Zk151XL3XmI3i-k",
      "18STu2xcXSi-SP8utpDdSpOyA7EJEYcU9",
      "18SGdkknAOIdxDeJkyOg22MwYLUa9HKyB",
      "18J3EFEwCye1_204hyeg48_3Gg0j26niC",
      "18HkjnCElht-QJQTFaWs2MmTwhA1wj9Xy",
      "18AhLAh9jdC45zTv9r8o9GdMhuuEzH2zD",
      "180c6lHeD3f0x6fCC9aTeouekachDt8xQ",
      "19xGnVk43vdYrm-z45xDeTpn9MQOqfcMm",
      "1AJ_eVwWX_xVRJRlBNLbtQzyRLCBR5aNG",
      "1ABGLFKV2EjKtMc1xMombfaaKrvV1HDMx",
      "1A2532UPoppgFPuZns9VgQVp0oZWPbIK6",
      "19y1urBiBel1jgRPM8VXub1_lRd57BTTb",
      "19y-dILbf6W6Mk5jBfhomMRM1sgel0np0",
      "19xW0cHhdDugtlHClIoJToy6zwo807IiS",
      "1Ahgifkd5RywdKZzgdoJyNcOy005VQkqj",
      "1Aq0FN1g7MwE4ovsojyGtM1TO9XpuBowY",
      "1ApmnqwAs5wD5qcGEQCmKGc7b8vVJPLLG",
      "1Am8eosYHwFFb2_G_9b4_MYLV8BQWhm73",
      "1AkN_8hMpVt57NXPKu8cFqBWLF7Dlft-a"
    ];

    try {
      const randomId = leaveVideos[Math.floor(Math.random() * leaveVideos.length)];
      const attachment = await drive.getFile(randomId, "stream");
      if (attachment) form.attachment = attachment;
    } catch (err) {
      console.error("[leave.js] Failed to get leave video:", err.message);
    }

    message.send(form);
  }
};
