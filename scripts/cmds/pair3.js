const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair3",
    aliases: [],
    version: "1.2",
    author: "💘 Rahad",
    countDown: 5,
    role: 0,
    shortDescription: "💞 𝗥𝗮𝗻𝗱𝗼𝗺 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 𝗪𝗶𝘁𝗵 𝗟𝗼𝘃𝗲",
    longDescription: "🥰 Pairs you with a random member and sends both avatars with love effects",
    category: "💌 𝗟𝗼𝘃𝗲",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, senderID, messageID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const list = threadInfo.participantIDs.filter(id => id !== senderID && id !== botID);
    const loveID = list[Math.floor(Math.random() * list.length)];

    const name1 = (await usersData.get(senderID)).name;
    const name2 = (await usersData.get(loveID)).name;

    const tags = [
      { id: senderID, tag: name1 },
      { id: loveID, tag: name2 }
    ];

    const lovePercent = Math.floor(Math.random() * 101);

    const avt1 = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(__dirname + "/cache/pairA.png", Buffer.from(avt1, "utf-8"));

    const avt2 = (await axios.get(`https://graph.facebook.com/${loveID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(__dirname + "/cache/pairB.png", Buffer.from(avt2, "utf-8"));

    const gif = (await axios.get("https://i.ibb.co/y4dWfQq/image.gif", { responseType: "arraybuffer" })).data;
    fs.writeFileSync(__dirname + "/cache/lovefire.gif", Buffer.from(gif, "utf-8"));

    const attachments = [
      fs.createReadStream(__dirname + "/cache/pairA.png"),
      fs.createReadStream(__dirname + "/cache/lovefire.gif"),
      fs.createReadStream(__dirname + "/cache/pairB.png")
    ];

    const msg = {
      body:
`╔═════ ∘◦ ❉ ◦∘ ═════╗
💘『 𝑯𝑬𝑨𝑹𝑻𝑺 𝑪𝑶𝑵𝑵𝑬𝑪𝑻𝑬𝑫 』💘
╚═════ ∘◦ ❉ ◦∘ ═════╝

💞 𝗡𝗮𝗺𝗲𝘀: ${name1} 🫶 ${name2}
❤️ 𝗟𝗼𝘃𝗲 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻: ${lovePercent}%
💌 𝗙𝗲𝗲𝗹𝗶𝗻𝗴: ${
  lovePercent > 85 ? "🌹 𝑭𝒂𝒕𝒆 𝒊𝒏𝒔𝒄𝒓𝒊𝒃𝒆𝒅 𝒊𝒏 𝒕𝒉𝒆 𝒔𝒕𝒂𝒓𝒔 ✨" :
  lovePercent > 60 ? "💘 𝑺𝒘𝒆𝒆𝒕 𝑺𝒐𝒖𝒍𝒎𝒂𝒕𝒆 𝑽𝒊𝒃𝒆𝒔 💞" :
  lovePercent > 30 ? "💖 𝑪𝒖𝒕𝒆 𝒂𝒏𝒅 𝑪𝒐𝒛𝒚 💑" :
  "😅 𝑷𝒆𝒓𝒉𝒂𝒑𝒔 𝒂 𝒇𝒓𝒊𝒆𝒏𝒅𝒔𝒉𝒊𝒑 𝒔𝒑𝒂𝒓𝒌?"
}

🕊️ 𝗟𝗼𝘃𝗲 𝗶𝘀 𝗶𝗻 𝘁𝗵𝗲 𝗮𝗶𝗿... 𝗮𝗻𝗱 𝗶𝘁 𝗰𝗵𝗼𝘀𝗲 𝘆𝗼𝘂 𝘁𝘄𝗼! 💫
✨ 𝗪𝗶𝘀𝗵𝗶𝗻𝗴 𝗮 𝘀𝗽𝗲𝗰𝗶𝗮𝗹 𝗯𝗼𝗻𝗱 𝗳𝗼𝗿𝗲𝘃𝗲𝗿 💍

🧿 𝗣𝗮𝗶𝗿𝗲𝗱 𝗕𝘆: 𝗥𝗮𝗵𝗮𝗱𝗕𝗼𝘁 💫
`,
      mentions: tags,
      attachment: attachments
    };

    return api.sendMessage(msg, threadID, messageID);
  }
};
