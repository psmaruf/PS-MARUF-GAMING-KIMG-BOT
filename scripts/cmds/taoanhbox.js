const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const Canvas = require("canvas");
const jimp = require("jimp");

module.exports.config = {
  name: "taoanhbox",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT Modified by Bayjid",
  description: "Generate group photo with avatars",
  commandCategory: "image",
  usages: "taoanhbox",
  cooldowns: 10
};

module.exports.onStart = async function ({ api, event }) {
  const threadID = event.threadID;
  const { participantIDs, threadName, adminIDs } = await api.getThreadInfo(threadID);
  const allMembers = participantIDs.slice(0, 30); // limit for performance
  const width = 1500, height = 800;
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  const bgURL = "https://i.imgur.com/P3QrAgh.jpg";
  const bgImg = await Canvas.loadImage((await axios.get(bgURL, { responseType: "arraybuffer" })).data);
  ctx.drawImage(bgImg, 0, 0, width, height);

  // Load avatar + draw border
  const cols = 6, size = 150, gap = 20;
  let x = 50, y = 100;

  for (let i = 0; i < allMembers.length; i++) {
    const uid = allMembers[i];
    try {
      const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
      const imgData = (await axios.get(url, { responseType: "arraybuffer" })).data;
      const avatar = await Canvas.loadImage(imgData);

      const borderColor = adminIDs.includes(uid) ? "red" : "blue";
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2 + 4, 0, Math.PI * 2);
      ctx.fillStyle = borderColor;
      ctx.fill();
      ctx.clip();
      ctx.drawImage(avatar, x, y, size, size);
      ctx.restore();

      x += size + gap;
      if ((i + 1) % cols === 0) {
        x = 50;
        y += size + gap;
      }
    } catch (err) {
      console.log("Avatar error:", err);
    }
  }

  // Group Info
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 35px Arial";
  ctx.fillText(`Group: ${threadName}`, 50, 50);
  ctx.fillText(`👥 Members: ${allMembers.length}`, 50, height - 100);
  ctx.fillText(`🛡️ Admins: ${adminIDs.length}`, 50, height - 50);

  // Save and send
  const filePath = path.join(__dirname, "cache", `${threadID}_box.png`);
  fs.writeFileSync(filePath, canvas.toBuffer());
  return api.sendMessage({ body: "📸 Group Photo Generated!", attachment: fs.createReadStream(filePath) }, threadID, () => fs.unlinkSync(filePath));
};
