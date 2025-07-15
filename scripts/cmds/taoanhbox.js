const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "taoanhbox",
    aliases: ["groupcard"],
    version: "1.2",
    author: "Bayjid x ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Create a group image card",
    longDescription: "Generates a visual group poster using members' avatars",
    category: "group",
    guide: "{pn} [optional title]",
  },

  onStart: async function ({ api, event, args }) {
    try {
      const threadID = event.threadID;
      const messageID = event.messageID;
      const threadInfo = await api.getThreadInfo(threadID);
      const members = threadInfo.participantIDs;
      const admins = threadInfo.adminIDs.map(e => e.id);
      const title = args.join(" ") || threadInfo.threadName || "Group Info";

      // Prepare cache folder
      const cacheDir = path.join(__dirname, "cache", "data");
      fs.ensureDirSync(cacheDir);

      // Download font if not exists
      const fontPath = path.join(cacheDir, "UTM-Avo.ttf");
      if (!fs.existsSync(fontPath)) {
        const fontUrl = "https://github.com/lamdaVn/font/raw/main/UTM-Avo.ttf";
        const fontRes = await axios.get(fontUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(fontPath, Buffer.from(fontRes.data));
      }

      Canvas.registerFont(fontPath, { family: "UTM-Avo" });

      // Setup canvas
      const canvas = Canvas.createCanvas(1500, 800);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#2C3E50";
      ctx.fillRect(0, 0, 1500, 800);

      // Add title text
      ctx.font = "bold 50px UTM-Avo";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(title, 750, 70);

      // Circle crop function
      const circle = async (buffer) => {
        const img = await jimp.read(buffer);
        img.circle();
        return await img.getBufferAsync("image/png");
      };

      // Draw avatars
      const avatarSize = 130;
      const padding = 30;
      let x = 70, y = 120, count = 0;
      const selected = members.sort(() => 0.5 - Math.random()).slice(0, 25);

      for (const uid of selected) {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1c2b1ab3e4c5b2c6`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        const rounded = await circle(res.data);
        const img = await Canvas.loadImage(rounded);
        ctx.drawImage(img, x, y, avatarSize, avatarSize);

        // Admin border
        if (admins.includes(uid)) {
          ctx.strokeStyle = "gold";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2 + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        x += avatarSize + padding;
        count++;
        if (count % 5 === 0) {
          x = 70;
          y += avatarSize + padding;
        }
      }

      // Save image and send
      const outputPath = path.join(cacheDir, `group_card_${Date.now()}.png`);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        api.sendMessage({
          body: `✅ Group Card Generated\n📛 Title: ${title}\n👥 Members: ${members.length}\n👑 Admins: ${admins.length}`,
          attachment: fs.createReadStream(outputPath),
        }, threadID, () => fs.unlinkSync(outputPath), messageID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to generate group card. Please try again later.", event.threadID, event.messageID);
    }
  },
};
