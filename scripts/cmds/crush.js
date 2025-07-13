const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "crush",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Priyansh Rajput + Fixed by ChatGPT",
  description: "Make couple image with mention",
  commandCategory: "fun",
  usages: "[@mention]",
  cooldowns: 5
};

module.exports.onStart = async function () {
  const imgPath = path.join(__dirname, "cache", "canvas");
  const bgPath = path.join(imgPath, "crush.png");

  try {
    if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath, { recursive: true });
    if (!fs.existsSync(bgPath)) {
      const imgURL = "https://i.imgur.com/PlVBaM1.jpg";
      const response = await axios.get(imgURL, { responseType: "arraybuffer" });
      fs.writeFileSync(bgPath, Buffer.from(response.data, "utf-8"));
      console.log("✅ crush.png downloaded");
    }
  } catch (err) {
    console.error("❌ Error in onStart:", err);
  }
};

async function circle(imagePath) {
  const image = await jimp.read(imagePath);
  image.circle();
  return image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const rootPath = path.join(__dirname, "cache", "canvas");
  const bgPath = path.join(rootPath, "crush.png");
  const pathImg = path.join(rootPath, `crush_${one}_${two}.png`);
  const avatarOne = path.join(rootPath, `avt_${one}.png`);
  const avatarTwo = path.join(rootPath, `avt_${two}.png`);

  try {
    console.log("🔁 Fetching avatars...");

    const [dataOne, dataTwo] = await Promise.all([
      axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512`, { responseType: "arraybuffer" }),
      axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512`, { responseType: "arraybuffer" })
    ]);

    fs.writeFileSync(avatarOne, Buffer.from(dataOne.data, "utf-8"));
    fs.writeFileSync(avatarTwo, Buffer.from(dataTwo.data, "utf-8"));

    const bg = await jimp.read(bgPath);
    const circOne = await jimp.read(await circle(avatarOne));
    const circTwo = await jimp.read(await circle(avatarTwo));

    bg.composite(circOne.resize(191, 191), 93, 111);
    bg.composite(circTwo.resize(190, 190), 434, 107);

    const raw = await bg.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);

    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);

    console.log("✅ Image generated:", pathImg);
    return pathImg;
  } catch (err) {
    console.error("❌ makeImage error:", err);
    throw new Error("ছবি তৈরিতে সমস্যা হয়েছে!");
  }
}

module.exports.run = async function ({ event, api }) {
  const mention = Object.keys(event.mentions);
  const { threadID, messageID, senderID } = event;

  if (!mention[0]) {
    return api.sendMessage("🥲 দোস্ত কাউকে তো ট্যাগ কর আগে!", threadID, messageID);
  }

  const one = senderID;
  const two = mention[0];

  try {
    const imgPath = await makeImage({ one, two });
    const msg = {
      body: "✧•❁𝐂𝐫𝐮𝐬𝐡❁•✧\n\n╔═══❖••° °••❖═══╗\n   𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n╚═══❖••° °••❖═══╝\n\n😏𝐃𝐇𝐎𝐑 𝐓𝐎𝐑 𝐆𝐅 𝐊𝐄 💘",
      attachment: fs.createReadStream(imgPath)
    };
    api.sendMessage(msg, threadID, () => fs.unlinkSync(imgPath), messageID);
  } catch (err) {
    api.sendMessage("❌ ছবি তৈরিতে সমস্যা হয়েছে!", threadID, messageID);
  }
};
