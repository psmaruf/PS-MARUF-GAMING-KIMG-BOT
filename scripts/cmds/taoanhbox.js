const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const Canvas = require("canvas");

module.exports.config = {
  name: "taoanhbox",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "shion + BayjidGPT",
  description: "Create group photo with admin/member borders & background",
  commandCategory: "group",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const backgrounds = [
    "https://i.imgur.com/P3QrAgh.jpg",
    "https://i.imgur.com/RueGAGI.jpg",
    "https://i.imgur.com/trR9fNf.jpg"
  ];

  const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];

  api.sendMessage("🖼️ Generating group photo... Please wait...", threadID, messageID);

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participantIDs.slice(0, 25); // max 25 members
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    const groupName = threadInfo.threadName || "Group Chat";

    // Load background
    const bgRes = await axios.get(bgURL, { responseType: "arraybuffer" });
    const bgImg = await Canvas.loadImage(Buffer.from(bgRes.data, "binary"));

    const canvas = Canvas.createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Text setup
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.strokeText(`Admins: ${adminIDs.length}`, 30, 50);
    ctx.fillText(`Admins: ${adminIDs.length}`, 30, 50);

    ctx.strokeText(`Members: ${members.length}`, canvas.width - 230, 50);
    ctx.fillText(`Members: ${members.length}`, canvas.width - 230, 50);

    ctx.font = "bold 42px Arial";
    ctx.strokeText(groupName, canvas.width / 2 - ctx.measureText(groupName).width / 2, 100);
    ctx.fillText(groupName, canvas.width / 2 - ctx.measureText(groupName).width / 2, 100);

    // Avatar layout
    const avatarSize = 100;
    const spacing = 20;
    const avatarsPerRow = 7;
    const offsetX = (canvas.width - ((avatarSize + spacing) * avatarsPerRow - spacing)) / 2;
    const startY = 150;

    for (let i = 0; i < members.length; i++) {
      const id = members[i];
      const isAdmin = adminIDs.includes(id);
      const x = offsetX + (i % avatarsPerRow) * (avatarSize + spacing);
      const y = startY + Math.floor(i / avatarsPerRow) * (avatarSize + spacing);

      try {
        const avatarURL = `https://graph.facebook.com/${id}/picture?width=512&height=512`;
        const avatarRes = await axios.get(avatarURL, { responseType: "arraybuffer" });
        const avatarImg = await Canvas.loadImage(Buffer.from(avatarRes.data, "binary"));

        // Draw avatar in circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, x, y, avatarSize, avatarSize);
        ctx.restore();

        // Draw border
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
        ctx.strokeStyle = isAdmin ? "red" : "#00FFFF";
        ctx.lineWidth = 6;
        ctx.stroke();

      } catch (e) {
        console.log(`❌ Failed avatar load: ${id}`);
      }
    }

    const imgPath = path.join(__dirname, "cache", `groupbox_${threadID}.png`);
    fs.writeFileSync(imgPath, canvas.toBuffer());

    api.sendMessage({
      body: `✅ Group image created successfully!`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath));

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Failed to generate image.", threadID, messageID);
  }
};
