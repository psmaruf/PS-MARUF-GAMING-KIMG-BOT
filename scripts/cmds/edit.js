const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    version: "1.0",
    author: "Rifat | Fixed by Rahad",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Edit image using prompt" },
    longDescription: { en: "Edit an uploaded image based on your prompt." },
    category: "image",
    guide: { en: "{p}edit [prompt] (reply to image)" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const attachment = event.messageReply?.attachments?.[0];

    if (!prompt || !attachment || attachment.type !== "photo") {
      return message.reply("⚠️ | Please reply to a photo with your editing prompt.\n\nExample:\n`edit make it black and white`");
    }

    const imageURL = attachment.url;
    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edited.jpg`);
    const waitMsg = await message.reply(`🎨 | Editing image...\n📝 Prompt: "${prompt}"\n⏳ Please wait...`);

    try {
      const apiURL = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imageURL)}`;
      const response = await axios.get(apiURL, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(response.data, "binary"));

      await message.reply({
        body: `✅ | Done! Here's your edited image for: "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("❌ EDIT Error:", err.response?.data || err.message || err);
      message.reply("❌ | Failed to edit image. API might be down or unsupported image format.");
    } finally {
      await fs.remove(imgPath);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
    }
  }
};
