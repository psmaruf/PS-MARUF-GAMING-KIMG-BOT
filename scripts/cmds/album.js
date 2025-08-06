const axios = require("axios");
const path = require("path");
const fs = require("fs");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "album",
    version: "1.1.0",
    role: 0,
    author: "Dipto + Rahad Style",
    description: "🖼️ Choose and view curated video/photo albums",
    category: "media",
    countDown: 5,
    guide: {
      en: "🌀 Usage: {p}{n} OR {p}{n} [category]\nExample: {p}{n} cartoon",
    },
  },

  onStart: async function ({ api, event, args }) {
    // Main options for first menu
    const menuOne = [
      "🎭 𝗙𝘂𝗻𝗻𝘆 𝘃𝗶𝗱𝗲𝗼",
      "🕌 𝗜𝘀𝗹𝗮𝗺𝗶𝗰 𝘃𝗶𝗱𝗲𝗼",
      "😢 𝗦𝗮𝗱 𝘃𝗶𝗱𝗲𝗼",
      "🌸 𝗔𝗻𝗶𝗺𝗲 𝘃𝗶𝗱𝗲𝗼",
      "🎨 𝗖𝗮𝗿𝘁𝗼𝗼𝗻 𝘃𝗶𝗱𝗲𝗼",
      "🎶 𝗟𝗼𝗙𝗶 𝗩𝗶𝗱𝗲𝗼",
      "🔥 𝗛𝗼𝗿𝗻𝘆 𝘃𝗶𝗱𝗲𝗼",
      "❤️ 𝗖𝗼𝘂𝗽𝗹𝗲 𝗩𝗶𝗱𝗲𝗼",
      "🌼 𝗙𝗹𝗼𝘄𝗲𝗿 𝗩𝗶𝗱𝗲𝗼",
      "🌀 𝗥𝗮𝗻𝗱𝗼𝗺 𝗣𝗵𝗼𝘁𝗼",
    ];

    // Second page menu (optional)
    const menuTwo = [
      "✨ 𝗔𝗲𝘀𝘁𝗵𝗲𝘁𝗶𝗰 𝗩𝗶𝗱𝗲𝗼",
      "⚡ 𝗦𝗶𝗴𝗺𝗮 𝗥𝘂𝗹𝗲",
      "🎤 𝗟𝘆𝗿𝗶𝗰𝘀 𝗩𝗶𝗱𝗲𝗼",
      "🐱 𝗖𝗮𝘁 𝗩𝗶𝗱𝗲𝗼",
      "🔞 18+ 𝘃𝗶𝗱𝗲𝗼",
      "🔥 𝗙𝗿𝗲𝗲 𝗙𝗶𝗿𝗲 𝘃𝗶𝗱𝗲𝗼",
      "⚽ 𝗙𝗼𝗼𝘁𝗕𝗮𝗹𝗹 𝘃𝗶𝗱𝗲𝗼",
      "👧 𝗚𝗶𝗿𝗹 𝘃𝗶𝗱𝗲𝗼",
      "👫 𝗙𝗿𝗶𝗲𝗻𝗱𝘀 𝗩𝗶𝗱𝗲𝗼",
    ];

    // Function to create a pretty styled menu string
    const buildMenu = (arr, startIndex = 1) => {
      let str ="╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n";
      str += ". │         🎬 𝗥𝗔𝗛𝗔𝗗 𝗔𝗟𝗕𝗨𝗠 🎬      │\n";
      str += ". ╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n";
      arr.forEach((item, idx) => {
        str += `⮞  ${startIndex + idx}. ${item}\n`;
      });
      str +=
        "\n✍️ 𝗥𝗲𝗽𝗹𝘆 𝗮 𝗻𝘂𝗺𝗯𝗲𝗿 𝘁𝗼 𝗰𝗵𝗼𝗼𝘀𝗲 𝗮𝗹𝗯𝘂𝗺\n" +
        "🆔 𝗦𝗲𝗻𝗱 𝗻𝗮𝗺𝗲 𝗮𝗳𝘁𝗲𝗿 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗳𝗼𝗿 𝗾𝘂𝗶𝗰𝗸 𝗿𝗲𝘀𝘂𝗹𝘁\n\n" +
        "✿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━✿";
      return str;
    };

    // If no args, show first menu
    if (!args[0]) {
      api.setMessageReaction("🎉", event.messageID, () => {}, true);
      const msg = buildMenu(menuOne, 1);
      return api.sendMessage(
        msg,
        event.threadID,
        (err, info) => {
          if (err) return console.error(err);
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            type: "page1",
            messageID: info.messageID,
            options: menuOne,
          });
        },
        event.messageID
      );
    }

    // If arg is 2, show second menu
    if (args[0] === "2") {
      api.setMessageReaction("🎉", event.messageID, () => {}, true);
      const msg = buildMenu(menuTwo, 11);
      return api.sendMessage(
        msg,
        event.threadID,
        (err, info) => {
          if (err) return console.error(err);
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            type: "page2",
            messageID: info.messageID,
            options: menuTwo,
          });
        },
        event.messageID
      );
    }

    // Handle direct category name usage
    const category = args[0].toLowerCase();

    // List of valid categories with query params
    const validCategories = {
      funny: "funny",
      islamic: "islamic",
      sad: "sad",
      anime: "anime",
      cartoon: "cartoon",
      lofi: "lofi",
      horny: "horny",
      couple: "love",
      flower: "flower",
      random: "photo",
      aesthetic: "aesthetic",
      sigma: "sigma",
      lyrics: "lyrics",
      cat: "cat",
      "18+": "sex",
      ff: "ff",
      football: "football",
      girl: "girl",
      friends: "friend",
    };

    if (!validCategories[category]) {
      return api.sendMessage(
        "❌ Invalid category! Use the command without arguments to see the list.",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("🔍", event.messageID, () => {}, true);

    try {
      const baseUrl = await baseApiUrl();
      const res = await axios.get(`${baseUrl}/album?type=${validCategories[category]}`);
      const videoUrl = res.data.data;

      // Download the media before sending
      const ext = path.extname(videoUrl);
      const filename = path.join(__dirname, `assets/album_${Date.now()}${ext}`);

      const mediaResponse = await axios.get(videoUrl, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      fs.writeFileSync(filename, Buffer.from(mediaResponse.data, "binary"));

      const caption = `
╭━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎬 𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 𝗔𝗹𝗯𝘂𝗺 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📁 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${category.toUpperCase()}      
┃ 📥 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗟𝗶𝗻𝗸: ${videoUrl}
╰━━━━━━━━━━━━━━━━━━━━━━━╯
      `.trim();

      await api.sendMessage(
        {
          body: caption,
          attachment: fs.createReadStream(filename),
        },
        event.threadID,
        () => fs.unlinkSync(filename),
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage(
        "❌ অনুগ্রহ করে সঠিক ক্যাটাগরি নির্বাচন করুন বা পরে আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const reply = parseInt(event.body);
    if (isNaN(reply)) {
      return api.sendMessage(
        "❌ ভুল ইনপুট! অনুগ্রহ করে ১ থেকে ১০ (বা ১১ থেকে ১৯) এর মধ্যে একটি নম্বর দিন।",
        event.threadID,
        event.messageID
      );
    }

    let selectedOption;
    if (Reply.type === "page1" && reply >= 1 && reply <= 10) {
      selectedOption = Reply.options[reply - 1];
    } else if (Reply.type === "page2" && reply >= 11 && reply <= 19) {
      selectedOption = Reply.options[reply - 11];
    } else {
      return api.sendMessage(
        "❌ Invalid selection number.",
        event.threadID,
        event.messageID
      );
    }

    const categoryKey = selectedOption
      .toLowerCase()
      .replace(/[^\w]/g, "")
      .replace("video", "")
      .trim();

    // Trigger album command again with selected category
    return this.onStart({
      api,
      event,
      args: [categoryKey],
    });
  },
};
