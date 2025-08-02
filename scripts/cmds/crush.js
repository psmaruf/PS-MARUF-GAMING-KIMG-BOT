const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");
const { downloadFile } = global.utils;

module.exports.config = {
  name: "crush",
  version: "7.3.1",
  hasPermssion: 0,
  credits: "Priyansh Rajput",
  description: "Get Pair From Mention",
  commandCategory: "png",
  usages: "[@mention]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

module.exports.onLoad = async () => {
  const dirMaterial = path.resolve(__dirname, 'cache', 'canvas');
  const baseImage = path.join(dirMaterial, 'crush.png');

  if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
  if (!fs.existsSync(baseImage)) {
    await downloadFile("https://i.imgur.com/PlVBaM1.jpg", baseImage);
  }
};

async function circle(bufferOrPath) {
  const image = await jimp.read(bufferOrPath);
  image.circle();
  return await image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const dir = path.resolve(__dirname, 'cache', 'canvas');
  const basePath = path.join(dir, 'crush.png');
  const output = path.join(dir, `crush_${one}_${two}.png`);

  const base = await jimp.read(basePath);
  const res1 = await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' });
  const res2 = await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' });

  const circ1 = await jimp.read(await circle(res1.data));
  const circ2 = await jimp.read(await circle(res2.data));

  base.composite(circ1.resize(191, 191), 93, 111)
      .composite(circ2.resize(190, 190), 434, 107);

  await base.writeAsync(output);
  return output;
}

module.exports.run = async ({ event, api, args }) => {
  const { threadID, messageID, senderID, mentions } = event;
  const mentionIDs = Object.keys(mentions);

  if (mentionIDs.length === 0) {
    return api.sendMessage("Please mention someone to pair with 😅", threadID, messageID);
  }

  const one = senderID;
  const two = mentionIDs[0];

  try {
    const imgPath = await makeImage({ one, two });
    return api.sendMessage(
      {
        body: `✧•❁𝐂𝐫𝐮𝐬𝐡❁•✧\n\n╔═══❖••° °••❖═══╗\n\n   𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n\n╚═══❖••° °••❖═══╝\n\n   ✶⊶⊷⊷❍⊶⊷⊷✶\n\n       👑𝐘𝐄 𝐋𝐄 𝐏𝐀𝐊𝐀𝐃 \n  𝐀𝐏𝐍𝐄 𝐂𝐑𝐔𝐒𝐇 𝐊𝐎 🩷\n\n   ✶⊶⊷⊷❍⊶⊷⊷✶`,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("Something went wrong while creating the image. Please try again later.", threadID, messageID);
  }
};
