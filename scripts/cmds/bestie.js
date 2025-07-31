const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

const templateURL = "https://i.imgur.com/RloX16v.jpg";
const templatePath = path.join(__dirname, "cache/canvas/bestu.png");

async function downloadTemplate() {
  const dir = path.dirname(templatePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(templatePath)) {
    const res = await axios.get(templateURL, { responseType: "arraybuffer" });
    fs.writeFileSync(templatePath, res.data);
  }
}

async function circle(image) {
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const root = path.join(__dirname, "cache/canvas");
  const baseImage = await jimp.read(templatePath);

  const avatarOnePath = path.join(root, `avt_${one}.png`);
  const avatarTwoPath = path.join(root, `avt_${two}.png`);
  const outputPath = path.join(root, `bestie_${one}_${two}.png`);

  const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;

  fs.writeFileSync(avatarOnePath, getAvatarOne);
  fs.writeFileSync(avatarTwoPath, getAvatarTwo);

  const circleOne = await jimp.read(await circle(avatarOnePath));
  const circleTwo = await jimp.read(await circle(avatarTwoPath));

  baseImage.composite(circleOne.resize(191, 191), 93, 111);
  baseImage.composite(circleTwo.resize(190, 190), 434, 107);

  const finalImage = await baseImage.getBufferAsync("image/png");
  fs.writeFileSync(outputPath, finalImage);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return outputPath;
}

module.exports = {
  config: {
    name: "bestie",
    version: "7.3.1",
    author: "Priyansh Rajput (Goat V2 by ChatGPT)",
    countDown: 5,
    role: 0,
    shortDescription: "Make bestie pair from mention",
    longDescription: "Generate a bestie pairing image using two profile pictures",
    category: "fun",
    guide: {
      en: "{pn} @mention"
    }
  },

  onStart: async function () {
    await downloadTemplate();
  },

  onRun: async function ({ message, event }) {
    const { senderID, mentions, threadID, messageID } = event;
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length === 0) {
      return message.reply("🙃 Tag at least one person to make your bestie!");
    }

    const one = senderID;
    const two = mentionIDs[0];

    try {
      const imagePath = await makeImage({ one, two });
      await message.reply({
        body:
          "✧•❁ 𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 ❁•✧\n\n" +
          "╔═══❖••° °••❖═══╗\n" +
          "   𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n" +
          "╚═══❖••° °••❖═══╝\n\n" +
          "✶⊶⊷⊷❍⊶⊷⊷✶\n" +
          "     👑 𝐘𝐞 𝐋𝐞 𝐌𝐢𝐥 𝐆𝐚𝐢 ❤\n" +
          "𝐓𝐞𝐫𝐢 𝐁𝐞𝐬𝐭𝐢𝐞 🩷\n" +
          "✶⊶⊷⊷❍⊶⊷⊷✶",
        attachment: fs.createReadStream(imagePath)
      });
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error("❌ Bestie Error:", err);
      message.reply("❌ ছবি তৈরি করতে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।");
    }
  }
};
