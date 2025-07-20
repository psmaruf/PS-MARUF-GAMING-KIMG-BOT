const { getStreamFromURL } = global.utils;
const talkedRecently = new Set();

module.exports = {
  config: {
    name: "emaudio",
    version: "1.0",
    author: "Father Rahad",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "Emotional audio reply"
    },
    longDescription: {
      en: "Sends emotional voice messages on emoji or text"
    },
    category: "media",
    guide: {
      en: "Just send 😀, 😄, 🥺, 🙂 or say i love you"
    },
    usePrefix: false
  },

  onChat: async function ({ event, message }) {
    const body = event.body?.toLowerCase()?.trim();
    if (!body) return;

    if (talkedRecently.has(event.senderID)) return;
    talkedRecently.add(event.senderID);
    setTimeout(() => talkedRecently.delete(event.senderID), 5000); // Anti-spam

    const voices = {
      "😀": {
        url: "https://drive.google.com/uc?export=download&id=13Jr2kZeMHOaVwsrX-FGBkwHmnOK3YkLm",
        body: "╭──🎉 𝗛𝗔𝗣𝗣𝗬 𝗠𝗢𝗠𝗘𝗡𝗧 ──╮\n😀 Smile louder... world listens.\n╰────────────────────────────╯"
      },
      "😄": {
        url: "https://drive.google.com/uc?export=download&id=13NVp3r8BhnfAGbe6eLLQaOhPWvnHRKqe",
        body: "╭──🌟 𝗝𝗢𝗬𝗙𝗨𝗟 𝗦𝗣𝗔𝗥𝗞 ──╮\n😄 Overflowing with happiness!\n╰────────────────────────────╯"
      },
      "🥺": {
        url: "https://drive.google.com/uc?export=download&id=13F1nJNnmyXS-H6kL6-00DPmOzjaDmZmc",
        body: "╭──🎧 𝗘𝗠𝗢𝗧𝗜𝗢𝗡𝗔𝗟 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘 ──╮\n🥺 Voice attached for this mood...\n╰────────────────────────────╯"
      },
      "🙂": {
        url: "https://drive.google.com/uc?export=download&id=13CWeUhyeyX6Yd-AX9IxWuCmkN8u8IDQL",
        body: "╭──🟢 𝗖𝗔𝗟𝗠 𝗦𝗠𝗜𝗟𝗘 ──╮\n🙂 Stay positive and keep calm.\n╰────────────────────────────╯"
      },
      "i love you": {
        url: "https://drive.google.com/uc?export=download&id=13NVp3r8BhnfAGbe6eLLQaOhPWvnHRKqe",
        body: "💔 𝗕𝗥𝗘𝗔𝗞𝗨𝗣 𝗧𝗢𝗡𝗘 𝗙𝗘𝗘𝗟𝗦...\n💔 𝗬𝗼𝘂 𝘀𝗮𝗶𝗱 '𝗜 𝗟𝗼𝘃𝗲 𝗬𝗼𝘂', 𝗯𝘂𝘁 𝘄𝗵𝘆 𝗱𝗶𝗱 𝘆𝗼𝘂 𝗹𝗲𝗮𝘃𝗲?\n🎧 Powered by Father Rahad"
      }
    };

    if (voices[body]) {
      const stream = await getStreamFromURL(voices[body].url);
      return message.reply({
        body: voices[body].body,
        attachment: stream
      });
    }
  }
};
