module.exports.config = {
  name: "crush",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Priyansh Rajput, adapted by You",
  description: "Pair two users with a fun crush image",
  commandCategory: "image",
  usages: "@mention",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "jimp": ""
  }
};

module.exports.run = async ({ event, api, args, global }) => {
  const mention = Object.keys(event.mentions);
  if (!mention.length) {
    return api.sendMessage("👉 Please mention someone to pair with!", event.threadID, event.messageID);
  }

  const fs = require("fs-extra");
  const path = require("path");
  const axios = require("axios");
  const jimp = require("jimp");

  const one = event.senderID;
  const two = mention[0];
  const cacheDir = path.join(__dirname, "..", "cache", "canvas");
  await fs.ensureDir(cacheDir);

  // Download base image if missing
  const basePath = path.join(cacheDir, "crush.png");
  if (!fs.existsSync(basePath)) {
    const { downloadFile } = global.utils;
    await downloadFile("https://i.imgur.com/PlVBaM1.jpg", basePath);
  }

  // helper for circle mask
  async function circle(srcPath, destPath) {
    const img = await jimp.read(srcPath);
    img.circle();
    await img.writeAsync(destPath);
  }

  try {
    // download avatars
    const [avatarOneBuf, avatarTwoBuf] = await Promise.all([
      axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${global.config.FACEBOOK_ACCESS_TOKEN}`, { responseType: 'arraybuffer' }),
      axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${global.config.FACEBOOK_ACCESS_TOKEN}`, { responseType: 'arraybuffer' })
    ]);

    const avatarOnePath = path.join(cacheDir, `avt_${one}.png`);
    const avatarTwoPath = path.join(cacheDir, `avt_${two}.png`);
    await fs.writeFile(avatarOnePath, avatarOneBuf.data);
    await fs.writeFile(avatarTwoPath, avatarTwoBuf.data);

    const circOnePath = avatarOnePath.replace('.png', '_circ.png');
    const circTwoPath = avatarTwoPath.replace('.png', '_circ.png');
    await Promise.all([
      circle(avatarOnePath, circOnePath),
      circle(avatarTwoPath, circTwoPath)
    ]);

    const bg = await jimp.read(basePath);
    const circleOne = await jimp.read(circOnePath);
    const circleTwo = await jimp.read(circTwoPath);

    bg.composite(circleOne.resize(191, 191), 93, 111)
      .composite(circleTwo.resize(190, 190), 434, 107);

    const outPath = path.join(cacheDir, `crush_${one}_${two}.png`);
    await bg.getBufferAsync("image/png").then(buf => fs.writeFileSync(outPath, buf));

    // clean temp avatars
    await fs.remove([avatarOnePath, avatarTwoPath, circOnePath, circTwoPath]);

    // send the message
    const message = {
      body: "✨ Crush Pairing! ✨\nHere's your couple image 💖",
      attachment: fs.createReadStream(outPath)
    };
    api.sendMessage(message, event.threadID, () => fs.unlinkSync(outPath), event.messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Something went wrong while creating the image.", event.threadID, event.messageID);
  }
};
