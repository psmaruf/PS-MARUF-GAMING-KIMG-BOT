const axios = require("axios");

module.exports = {
  config: {
    name: "slap",
    version: "1.1",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Slap someone",
    longDescription: "Mention a user to slap them with a random GIF",
    category: "fun",
    guide: "{pn} @mention"
  },

  onStart: async function ({ event, message, usersData }) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
      return message.reply("कृपया किसी को slap करने के लिए mention करें!");
    }

    async function getSlapGif() {
      try {
        const res = await axios.get("https://api.waifu.pics/sfw/slap");
        return res.data.url;
      } catch (err) {
        console.error("GIF fetch error:", err);
        return "https://media.tenor.com/images/d1d5ebc5b91d5e91893f6d653e32e72f/tenor.gif";
      }
    }

    const slapGif = await getSlapGif();
    let mentionedUser = Object.keys(event.mentions)[0];
    let senderName = await usersData.getName(event.senderID);
    let mentionedName = await usersData.getName(mentionedUser);

    let replyMsg = `😡 ${senderName} ने ${mentionedName} को ज़ोरदार थप्पड़ मारा!`;

    message.reply({
      body: replyMsg,
      attachment: await global.utils.getStreamFromURL(slapGif)
    });
  }
};
