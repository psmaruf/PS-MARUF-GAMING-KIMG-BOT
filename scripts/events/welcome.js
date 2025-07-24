const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// All 14 welcome video IDs
const welcomeVideos = [
  "1-RV0_mJS0vAZpvO6IDK3f5eJuLIE3jhm",
  "112ZN4pmSeC-HQwi-mG1jrI9qSLKufx7-",
  "11Day-bKc4UqdPtAI2hih7qya7HRb-vqU",
  "11D5NNC6idmP-b73pW9NWyFxJLKwgrhXs",
  "11BCayJggvB3dYlyRhOXAvNIEskJwpCQy",
  "119ylfNLTQuWY7wvfhsEp1yiJqZWkTOU9",
  "119a5bZ4PuXwe8YRVVVXqXZo4C-scjAvf",
  "173duL96CL-OJKt_ZGxtqbwPh38bZ0fQk",
  "17SXiqh-_zd3yRUmzp7s10YFhlK3hROOl",
  "17NvXt3Ss03yEyloiJ8yCPqvwQH8n2QgC",
  "17MiM6FTnnDuNAGJFRQOobEkZvQ_p7VRI",
  "17JmAJ9qe6yIMDVFII_wc2soOaSmrQwFG",
  "17FglmV8XgzNCXFmhoOwAGamYGUQdt3yL",
  "177hZ758fhPfSmTMTXs4MFX2tMsyk_q__"
];

module.exports = {
  config: {
    name: "welcome",
    version: "3.0",
    author: "BaYjid",
    category: "events"
  },

  langs: {
    en: {
      session1: "☀ 𝓜𝓸𝓻𝓷𝓲𝓷𝓰",
      session2: "⛅ 𝓝𝓸𝓸𝓷",
      session3: "🌆 𝓐𝓯𝓽𝓮𝓻𝓷𝓸𝓸𝓷",
      session4: "🌙 𝓔𝓿𝓮𝓷𝓲𝓷𝓰",
      welcomeMessage:
        "🎉 『 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 』 🎉\n\n💠 𝗛𝗲𝘆 {userName}!\n🔹 𝗬𝗼𝘂 𝗷𝘂𝘀𝘁 𝗷𝗼𝗶𝗻𝗲𝗱 『 {boxName} 』\n⏳ 𝗧𝗶𝗺𝗲 𝗳𝗼𝗿 𝘀𝗼𝗺𝗲 𝗳𝘂𝗻! 𝗛𝗮𝘃𝗲 𝗮 𝗳𝗮𝗻𝘁𝗮𝘀𝘁𝗶𝗰 {session} 🎊\n\n⚠ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗳𝗼𝗹𝗹𝗼𝘄 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽 𝗿𝘂𝗹𝗲𝘀! 🚀\n\n👤 𝗔𝗱𝗱𝗲𝗱 𝗯𝘆: {adderName}",
      multiple1: "🔹 𝖸𝗈𝗎",
      multiple2: "🔹 𝖸𝗈𝗎 𝖦𝗎𝗒𝗌"
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const added = logMessageData.addedParticipants;
    const hours = parseInt(getTime("HH"));
    const nickNameBot = global.GoatBot.config.nickNameBot;

    // If bot was added
    if (added.some(u => u.userFbId === api.getCurrentUserID())) {
      if (nickNameBot)
        await api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
      return message.send(getLang("welcomeMessage", global.utils.getPrefix(threadID)));
    }

    if (!global.temp.welcomeEvent[threadID])
      global.temp.welcomeEvent[threadID] = { joinTimeout: null, data: [] };

    global.temp.welcomeEvent[threadID].data.push(...added);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
      const td = await threadsData.get(threadID);
      const members = global.temp.welcomeEvent[threadID].data;
      const banned = td.data.banned_ban || [];
      const threadName = td.threadName;

      // Filter banned users out
      const newMembers = members.filter(m => !banned.some(b => b.id === m.userFbId));
      if (newMembers.length === 0) return;

      // Mentions for new users
      const mentions = newMembers.map(u => ({ tag: u.fullName, id: u.userFbId }));

      // Names combined
      const names = newMembers.map(u => u.fullName).join(", ");

      // Info of the person who added
      const adderInfo = await api.getUserInfo(event.author);
      const adderName = adderInfo[event.author]?.name || "Someone";
      mentions.push({ tag: adderName, id: event.author });

      // Session based greeting
      let session;
      if (hours <= 10) session = getLang("session1");
      else if (hours <= 12) session = getLang("session2");
      else if (hours <= 18) session = getLang("session3");
      else session = getLang("session4");

      // Dynamic user name text based on number of users
      const userNameText = newMembers.length > 1 ? getLang("multiple2") : getLang("multiple1");

      // Compose message body
      const body = getLang("welcomeMessage")
        .replace("{userName}", `${userNameText} (${names})`)
        .replace("{boxName}", threadName)
        .replace("{session}", session)
        .replace("{adderName}", adderName);

      // Pick a random video
      const fileId = welcomeVideos[Math.floor(Math.random() * welcomeVideos.length)];
      let attachment = null;

      try {
        const stream = await drive.getFile(fileId, "stream");
        if (stream) attachment = [stream];
      } catch (err) {
        console.error("❌ Video Load Error:", err.message);
        // You can optionally add a fallback image/gif here if desired
      }

      await message.send({ body, mentions, attachment });
      delete global.temp.welcomeEvent[threadID];
    }, 2500);
  }
};
