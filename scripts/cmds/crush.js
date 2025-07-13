const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "crush",
  version: "1.0.3",
  hasPermission: 0,
  credits: "Priyansh Rajput + Fixed by ChatGPT",
  description: "Make a cute crush photo 😍",
  commandCategory: "fun",
  usages: "[@mention]",
  cooldowns: 5
};

module.exports.onStart = async () => {
  const dir = path.join(__dirname, "cache", "canvas");
  const bgPath = path.join(dir, "crush.png");

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(bgPath)) {
      const bgImg = await axios.get("https://i.imgur.com/PlVBaM1.jpg", { responseType: "arraybuffer" });
      fs.writeFileSync(bgPath, bgImg.data);
      console.log("✅ Crush background saved.");
    }
  } catch (err) {
    console.error("❌ Crush onStart Error:", err);
  }
};

async function circle(path) {
  const img = await jimp.read(path);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const cache = path.join(__dirname, "cache", "canvas");
  const bg = path.join(cache, "crush.png");
  const pathAva1 = path.join(cache, `${one}.png`);
  const pathAva2 = path.join(cache, `${two}.png`);

  try {
    // Download avatars
    const [ava1, ava2] = await Promise.all([
      axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512`, { responseType: "arraybuffer" }),
      axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512`, { responseType: "arraybuffer" })
    ]);
    fs.writeFileSync(pathAva1, ava1.data);
    fs.writeFileSync(pathAva2, ava2.data);

    // Load background and circle avatars
    const img = await jimp.read(bg);
    const avatar1 = await jimp.read(await circle(pathAva1));
    const avatar2 = await jimp.read(await circle(pathAva2));

    // Place avatars
    img.composite(avatar1.resize(191, 191), 93, 111);
    img.composite(avatar2.resize(190, 190), 434, 107);

    const finalPath = path.join(cache, `crush_${Date.now()}.png`);
    await img.writeAsync(finalPath);

    // Clean temp
    fs.unlinkSync(pathAva1);
    fs.unlinkSync(pathAva2);

    return finalPath;
  } catch (e) {
    console.error("❌ makeImage error:", e);
    throw new Error("ছবি বানাতে গিয়া গন্ডগোল হইছে ভাই 😓");
  }
}

module.exports.run = async ({ event, api }) => {
  const mention = Object.keys(event.mentions);
  const { threadID, messageID, senderID } = event;

  if (mention.length === 0) {
    return api.sendMessage("🥺 কাউরে mention তো কর 😐", threadID, messageID);
  }

  try {
    const imgPath = await makeImage({ one: senderID, two: mention[0] });

    api.sendMessage({
      body: "😍 তোমার Crush এর সাথে perfect photo!",
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath), messageID);

  } catch (err) {
    api.sendMessage("❌ ছবিটা বানাতে পারি নাই ভাই 😭\nসমস্যা:", threadID, messageID);
  }
};
