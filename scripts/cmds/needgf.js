const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const encodedUrl = "aHR0cHM6Ly9yYXNpbi14LWFwaXMub25yZW5kZXIuY29tL2FwaS9yYXNpbi9nZg==";
const encodedKey = "cnNfdDFnM2Izc2EtOXloZS1ja3g3LTlvdzEtcnA=";

function decode(b64) {
  return Buffer.from(b64, "base64").toString("utf-8");
}

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error(`Image fetch failed with status: ${res.statusCode}`));
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", err => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      reject(err);
    });
  });
}

module.exports = {
  config: {
    name: "needgf",
    version: "1.0.0",
    author: "Rahad",
    countDown: 20,
    role: 0,
    shortDescription: "সিঙ্গেলদের জন্য জিএফ ছবি",
    longDescription: "একটি র‍্যান্ডম গার্লফ্রেন্ড ছবি পাঠায়, শুধু সিঙ্গেলদের জন্য!",
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event }) {
    const apiUrl = decode(encodedUrl);
    const apiKey = decode(encodedKey);
    const fullUrl = `${apiUrl}?apikey=${apiKey}`;

    try {
      const res = await axios.get(fullUrl);
      if (!res.data?.data?.title || !res.data?.data?.url)
        throw new Error("Invalid API response");

      const title = res.data.data.title;
      const imgUrl = res.data.data.url;

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `${event.senderID}_gf.jpg`);
      await downloadImage(imgUrl, imgPath);

      await message.reply({
        body: title,
        attachment: fs.createReadStream(imgPath)
      });

      fs.unlinkSync(imgPath); // Clean up
    } catch (err) {
      console.error("❌ Error in needgf command:", err);
      message.reply("😔 দুঃখিত, এই মুহূর্তে ছবি আনতে পারলাম না। একটু পরে আবার চেষ্টা করুন!");
    }
  }
};
