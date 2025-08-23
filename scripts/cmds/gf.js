// gf.js
const fs = require("fs-extra");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "gf",
    aliases: ["couple"],
    version: "3.0",
    author: "Rahad",
    countDown: 5,
    role: 0,
    shortDescription: "Couple edit with template background",
    longDescription: "Put profile pictures on given template background",
    category: "funny",
    guide: "{pn} @tag"
  },

  onStart: async function ({ event, api }) {
    try {
      let id1 = event.senderID;
      let id2 = Object.keys(event.mentions)[0];
      if (!id2) return api.sendMessage("❌ | Please mention someone!", event.threadID, event.messageID);

      // Avatars
      const avatar1 = await Canvas.loadImage(`https://graph.facebook.com/${id1}/picture?height=512&width=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      const avatar2 = await Canvas.loadImage(`https://graph.facebook.com/${id2}/picture?height=512&width=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

      // Background (template)
      const background = await Canvas.loadImage("https://i.imgur.com/iaOiAXe.jpeg");

      // Canvas same as template
      const canvas = Canvas.createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // === Place avatar1 on left circle ===
      ctx.save();
      ctx.beginPath();
      ctx.arc(260, 350, 120, 0, Math.PI * 2, true); // (x, y, radius)
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 140, 230, 240, 240);   // (x, y, width, height)
      ctx.restore();

      // === Place avatar2 on right circle ===
      ctx.save();
      ctx.beginPath();
      ctx.arc(620, 350, 120, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 500, 230, 240, 240);
      ctx.restore();

      // Save
      const path = __dirname + "/cache/gf.png";
      const out = fs.createWriteStream(path);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", () => {
        api.sendMessage(
          {
            body: `💞 Couple edit complete!`,
            attachment: fs.createReadStream(path)
          },
          event.threadID,
          () => fs.unlinkSync(path),
          event.messageID
        );
      });
    } catch (err) {
      console.log(err);
      api.sendMessage("❌ | Something went wrong!", event.threadID, event.messageID);
    }
  }
};
