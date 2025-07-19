const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "crush",
    aliases: [],
    version: "1.0",
    author: "Priyansh Rajput + Modified by RAHAD",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Make a photo with your crush 💞"
    },
    longDescription: {
      en: "Mention someone and get a cute couple image with them"
    },
    category: "fun",
    guide: {
      en: "{pn} @mention"
    }
  },

  // Load image background on bot start
  onLoad: async () => {
    const dir = path.join(__dirname, "cache", "canvas");
    const imgPath = path.join(dir, "crush.png");

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(imgPath)) {
      const imgData = (
        await axios.get("https://i.imgur.com/PlVBaM1.jpg", {
          responseType: "arraybuffer"
        })
      ).data;
      fs.writeFileSync(imgPath, imgData);
    }
  },

  // Main run function
  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0)
      return message.reply("😅 Please mention someone to make them your crush!");

    const senderID = event.senderID;
    const mentionedID = mention[0];

    const imagePath = await createCrushImage({ one: senderID, two: mentionedID });

    return message.reply({
      body:
        "✧•❁𝐂𝐫𝐮𝐬𝐡❁•✧\n\n" +
        "╔═══❖••° °••❖═══╗\n" +
        "  💘 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 💘\n" +
        "╚═══❖••° °••❖═══╝\n\n" +
        "     👑 𝐘𝐄 𝐋𝐄 𝐏𝐀𝐊𝐀𝐃 💖\n" +
        "     𝐀𝐏𝐍𝐄 𝐂𝐑𝐔𝐒𝐇 𝐊𝐎 🩷",
      attachment: fs.createReadStream(imagePath)
    }, () => fs.unlinkSync(imagePath));
  }
};

// Helper to crop to circle
async function circle(imagePath) {
  const img = await jimp.read(imagePath);
  img.circle();
  return await img.getBufferAsync("image/png");
}

// Main function to create couple image
async function createCrushImage({ one, two }) {
  const dir = path.join(__dirname, "cache", "canvas");
  const bgPath = path.join(dir, "crush.png");
  const outPath = path.join(dir, `crush_${one}_${two}.png`);
  const avatar1Path = path.join(dir, `avt_${one}.png`);
  const avatar2Path = path.join(dir, `avt_${two}.png`);

  // Download avatar
  const getAvatar = async (uid, savePath) => {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(savePath, res.data);
  };

  await getAvatar(one, avatar1Path);
  await getAvatar(two, avatar2Path);

  // Read images
  const bg = await jimp.read(bgPath);
  const circ1 = await jimp.read(await circle(avatar1Path));
  const circ2 = await jimp.read(await circle(avatar2Path));

  // Compose final image
  bg.composite(circ1.resize(191, 191), 93, 111);
  bg.composite(circ2.resize(190, 190), 434, 107);

  const finalBuffer = await bg.getBufferAsync("image/png");
  fs.writeFileSync(outPath, finalBuffer);

  // Clean up
  fs.unlinkSync(avatar1Path);
  fs.unlinkSync(avatar2Path);

  return outPath;
}
