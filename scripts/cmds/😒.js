const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "😒",
    version: "1.3",
    author: "Bayjid x ChatGPT",
    countDown: 0,
    role: 0,
    shortDescription: "😒 emoji dile stylish video message",
    longDescription: "Reply with styled text + random video",
    category: "no prefix",
    guide: "Send 😒"
  },

  onStart: async function () {
    // Empty to prevent load errors
  },

  onChat: async function ({ message, event }) {
    if (event.body !== "😒") return;

    const videos = [  
      { id: "10yxHLNf-xHdUwe7DIREwNjYuv7QnlZhg", fileName: "smile1.mp4" },  
      { id: "10zMRj7YzXh-sR2aXqay0LvWG0c9-GPG9", fileName: "smile2.mp4" },  
      { id: "12HJSioqSH7R-xQsUy-Tz8Mwm85NAKZ7N", fileName: "smile3.mp4" },  
      { id: "12UXM90BMO_CmGpJ_hJEHUBtPOuCZdJi4", fileName: "smile4.mp4" },  
      { id: "12HukTManm0o96mJhNRw-C6CEKKlOd2nT", fileName: "smile5.mp4" },  
      { id: "12ZOEmiNiBHJZe242GrAnkEJdNU0g5oJh", fileName: "smile6.mp4" },  
      { id: "139WjbWCN1TxvRGT5RznDpcnneVH0V6sq", fileName: "smile7.mp4" },  
      { id: "136pN0l041XZperefewGtH8aHEE-NR_FH", fileName: "smile8.mp4" },  
      { id: "1337uA4zTeojcHuZ9C2CRTUV-O7Krcqid", fileName: "smile9.mp4" },  
      { id: "131N3GMAVRWm4CLI-ZPSQocNdABpIMOrs", fileName: "smile10.mp4" },  
      { id: "12oFUxI3nbRhbUy3ecaOi4Xd6HBIe4qnm", fileName: "smile11.mp4" },  
      { id: "12lNPrGx4v2gQsAd0Wzpegutn7oct54GR", fileName: "smile12.mp4" },  
      { id: "12chv1WFL_j-Nh0HvVhWPGCokGf5k-bJO", fileName: "smile13.mp4" }  
    ];  

    const chosen = videos[Math.floor(Math.random() * videos.length)];  
    const cacheDir = path.join(__dirname, "cache");  
    const filePath = path.join(cacheDir, chosen.fileName);  

    await fs.ensureDir(cacheDir);  

    if (!fs.existsSync(filePath)) {  
      try {  
        const url = `https://drive.google.com/uc?export=download&id=${chosen.id}`;  
        const response = await axios({ method: "GET", url, responseType: "stream" });  
        const writer = fs.createWriteStream(filePath);  
        response.data.pipe(writer);  
        await new Promise((resolve, reject) => {  
          writer.on("finish", resolve);  
          writer.on("error", reject);  
        });  
      } catch (err) {  
        console.error("Download error:", err);  
        return message.reply("❌ Video download fail hoise boss.");  
      }  
    }  

    const bodyText = `
╭─━━━━━━━━━━⊱❉⊰━━━━━━━━━━─╮
😒 𝗘𝗠𝗢𝗝𝗜 𝗗𝗘𝗦 𝗞𝗘𝗡 𝗕𝗕𝗭??
💅 𝗧𝗨𝗜 𝗞𝗜 𝗔𝗠𝗔𝗥 𝗕𝗢𝗦𝗦 𝗥𝗔𝗛𝗔𝗗-𝗘𝗥 𝗚𝗙 𝗛𝗢𝗧𝗘 𝗖𝗔𝗜𝗦?
💘 𝗡𝗔𝗞𝗜 𝗞𝗔𝗨𝗞𝗘 𝗣𝗧𝗔𝗜 𝗗𝗜𝗧𝗘 𝗖𝗔𝗜𝗦 𝗕𝗢𝗦𝗦-𝗘𝗥 𝗝𝗔𝗡𝗡𝗔𝗬?
📞 𝗕𝗢𝗦𝗦 𝗕𝗢𝗟𝗘𝗖𝗛𝗘 — “𝗝𝗢𝗗𝗜 𝗞𝗔𝗨𝗞𝗘 𝗣𝗔𝗧𝗛𝗔𝗧𝗘 𝗖𝗔𝗜𝗦, 𝗕𝗔𝗕𝗬, 𝗞𝗢𝗠𝗘𝗡𝗧 𝗗𝗘𝗞𝗛𝗜𝗘 𝗙𝗘𝗟” 💬
🎁 𝗚𝗙 𝗛𝗨𝗡𝗧 𝗠𝗢𝗗𝗘 𝗢𝗡 🔎 𝗘𝗞𝗛𝗔𝗡 𝗘𝗞𝗧𝗔 𝗩𝗜𝗗𝗘𝗢 𝗡𝗘 — 𝗞𝗛𝗔𝗟𝗜 𝗞𝗛𝗔𝗧𝗔 𝗡𝗔𝗜 🫶👇
╰─━━━━━━━━━━⊱❉⊰━━━━━━━━━━─╯
`;

    return message.reply({
      body: bodyText,
      attachment: fs.createReadStream(filePath)
    });
  }
};
