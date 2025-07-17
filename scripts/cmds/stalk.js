const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "stalk",
    version: "1.3",
    author: "Bayjid & ChatGPT",
    shortDescription: { en: "FB stalk with photo and cover" },
    longDescription: { en: "View Facebook user info with photo attachments" },
    category: "tools",
    guide: { en: "{pn} [UID or FB link] or reply to someone's message" }
  },

  onStart: async function ({ message, args, event }) {
    let uid;

    // If message is a reply, get senderID from replied message
    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else if (args[0]) {
      uid = args[0].includes("facebook.com")
        ? args[0].split("/").pop().split("?")[0]
        : args[0];
    } else {
      return message.reply("❌ Please provide a UID or reply to someone's message.");
    }

    const api = `https://api-dien.kira1011.repl.co/stalk?uid=${uid}`;

    try {
      const res = await axios.get(api);
      const info = res.data.result;

      const text = `
🔍 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝗦𝗧𝗔𝗟𝗞 𝗥𝗘𝗣𝗢𝗥𝗧
──────────────────────
📁 𝗕𝗔𝗦𝗜𝗖 𝗜𝗡𝗙𝗢
👤 Name: ${info.name}
⚡ Fast Name: ${info.firstName}
🆔 UID: ${info.uid}
🔗 Username: ${info.username || "No username"}
🌐 Profile Link: ${info.link}
📅 Created: ${info.created_time || "No data"} || ${info.time || ""}
☑️ Verified: ${info.is_verified ? "✅ Verified" : "❌ Not Verified"}

🧠 𝗣𝗘𝗥𝗦𝗢𝗡𝗔𝗟 𝗜𝗡𝗙𝗢
🎂 Birthday: ${info.birthday || "No Data"}
🗣️ Gender: ${info.gender || "No Data"}
💘 Relationship: ${info.relationship_status || "No Data"}
💋 Nickname: ${info.nicknames?.join(", ") || "None"}
💭 Love Status: ${info.love || "No Data"}
🧠 About: ${info.about || "No Data"}
🧡 Quotes: ${info.quotes || "No Data"}

🌍 𝗟𝗢𝗖𝗔𝗧𝗜𝗢𝗡 & 𝗪𝗘𝗕
🏠 Hometown: ${info.hometown || "No Data"}
📌 Locale: ${info.locale || "No Data"}
🌐 Website: ${info.website || "No Data"}

📊 𝗦𝗢𝗖𝗜𝗔𝗟 𝗔𝗖𝗧𝗜𝗩𝗜𝗧𝗬
👥 Followers: ${info.follow || "No Data"}
🏢 Works At: ${info.work || "No Data"}
──────────────────────`.trim();

      const attachments = [];

      if (info.profile_picture) {
        try {
          attachments.push(await getStreamFromURL(info.profile_picture));
        } catch (e) {}
      }

      if (info.cover_photo) {
        try {
          attachments.push(await getStreamFromURL(info.cover_photo));
        } catch (e) {}
      }

      message.reply({ body: text, attachment: attachments });

    } catch (err) {
      console.log(err);
      message.reply("❌ Failed to fetch data. Maybe UID is wrong or server is down.");
    }
  }
};
