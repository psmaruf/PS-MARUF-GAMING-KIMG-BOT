const axios = require("axios");

module.exports = {
  config: {
    name: "anime",
    aliases: ["animev", "ani"],
    version: "1.0",
    author: "Rahad Ff",
    countDown: 30,
    role: 0,
    shortDescription: "Send anime video",
    longDescription: "Sends a random anime video (direct, no link)",
    category: "fun",
    guide: "{p}anime"
  },

  sentVideos: [],

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply("📤 Loading anime video...");

    const link = [
      "https://drive.google.com/uc?export=download&id=1-jH5mtg5utql0zpAakFN1wBEhUBXHEJ7",
      "https://drive.google.com/uc?export=download&id=1-qnnWo6cAAZoPG4VNeKMauYgebBl3Ih-",
      "https://drive.google.com/uc?export=download&id=1-wbVqEDQnGl0TrPaZ_JEv-5EyxruVfNh",
      "https://drive.google.com/uc?export=download&id=10-Hzcy_Y3OgjnFe9M8SzFtsk-G_NaE02",
      "https://drive.google.com/uc?export=download&id=102jEB4TuGPP5sfDsYHu62ufwzDl_6YFD",
      "https://drive.google.com/uc?export=download&id=10IoB_gumUZijO8nzShwEeeB0ZHDc2_iJ",
      "https://drive.google.com/uc?export=download&id=10_bmKZBVufqSJ5_bKWUMJvNq7OFGC7My",
      "https://drive.google.com/uc?export=download&id=10Zk8-9exBWM2yJj2HfwCYpyi51E9BKd7",
      "https://drive.google.com/uc?export=download&id=10YBQJwLm5Wdq5FOKIblLsisUlEVoGKgk",
      "https://drive.google.com/uc?export=download&id=10XG3GZxoDx2iU2tsTVidxj2HS3R0scc1",
      "https://drive.google.com/uc?export=download&id=10LvbnbzUNBg7nf5PK3d7h_-yAGt04WGQ",
      "https://drive.google.com/uc?export=download&id=10KRyq6C-GAkdrMj9dSK04F1MdBruzts4",
      "https://drive.google.com/uc?export=download&id=103B66nBxLtJDh2dLlv6bQZynRNcj675f",
      "https://drive.google.com/uc?export=download&id=102gwONoMStLZxNUuRH7SQ0j8mmwoGMg6",
      "https://drive.google.com/uc?export=download&id=10SjJTy2vQAn61ZE4rxSu-mAbm37zUp0l",
      "https://drive.google.com/uc?export=download&id=10QycYgsTagrN90cWJCIWWVwmps2kk_oF",
      "https://drive.google.com/uc?export=download&id=10QRozgsmf7p70xBPCn9rH2NS3qnQ0_iV",
      "https://drive.google.com/uc?export=download&id=10H7iMM8we0ydR7oV9_pS1L5iDbrFy03c",
      "https://drive.google.com/uc?export=download&id=10AMKntAWDFnUYnlY8Dfv9iQTk9vilIIp"
    ];

    const availableVideos = link.filter(video => !this.sentVideos.includes(video));

    if (availableVideos.length === 0) {
      this.sentVideos = [];
    }

    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    const randomVideo = availableVideos[randomIndex];
    this.sentVideos.push(randomVideo);

    try {
      await message.reply({
        body: "╰☆☆ ✨ 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨! ☆☆╮",
        attachment: await global.utils.getStreamFromURL(randomVideo)
      });
    } catch (err) {
      await message.reply("❌ Failed to load video.");
    }

    setTimeout(() => {
      api.unsendMessage(loadingMessage.messageID);
    }, 3000);
  }
};
