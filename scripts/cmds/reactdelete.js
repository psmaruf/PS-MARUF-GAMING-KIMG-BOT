module.exports = {
  config: {
    name: "reactdelete",
    version: "1.0",
    author: "Rahad",
    role: 0,
    shortDescription: "React 😾 to bot's message to delete it",
    longDescription: "If someone reacts 😾 to a bot's message, the bot will unsend it",
    category: "automation",
    guide: {
      en: "Just react 😾 to a message sent by the bot, and it will delete that message."
    }
  },

  onReaction: async function ({ api, event }) {
    try {
      // Check if message was sent by bot itself
      if (event.userID == global.GoatBot.botID && event.reaction == "😾") {
        await api.unsendMessage(event.messageID);
      }
    } catch (err) {
      console.error("reactdelete error:", err);
    }
  }
};
