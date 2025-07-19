const fs = require("fs-extra");
const axios = require("axios");
const jimp = require("jimp");
const path = require("path");

module.exports = {
  config: {
    name: "crush",
    version: "1.1",
    author: "RAHAD",
    role: 0,
    shortDescription: { en: "Make a crush image" },
    longDescription: { en: "Generate crush styled image with your dp and other's" },
    category: "image",
    guide: { en: "{pn} @tag" }
  },

  onStart: async function ({ message, event, api, usersData }) {
    const mention = Object.keys(event.mentions)[0];
    if (!mention) return message.reply("❌ | Tag your crush first!");

    const one = event.senderID;
    const two = mention;

    const name1 = await usersData.getName(one);
    const name2 = await usersData.getName(two);

    const avatar1 = `https://graph.facebook.com/${one}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${two}/picture?width=512&height=512`;

    const img1 = await jimp.read((await axios.get(avatar1, { responseType: "arraybuffer" })).data);
    const img2 = await jimp.read((await axios.get(avatar2, { responseType: "arraybuffer" })).data);
    const bg = await jimp.read(path.join(__dirname, "cache", "crush.png"));

    img1.resize(170, 170).circle();
    img2.resize(170, 170).circle();

    bg.composite(img1, 180, 200);
    bg.composite(img2, 490, 200);

    const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
    bg.print(font, 170, 400, name1);
    bg.print(font, 480, 400, name2);

    const imgPath = path.join(__dirname, "cache", `crush-${one}-${two}.png`);
    await bg.writeAsync(imgPath);

    return message.reply({
      body: `💘 | ${name1} + ${name2} = Crush confirmed!`,
      attachment: fs.createReadStream(imgPath)
    }, () => fs.unlinkSync(imgPath));
  }
};
