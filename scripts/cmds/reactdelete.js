module.exports = {
  config: {
    name: "reactdelete",
    version: "1.0",
    author: "Father Rahad",
    role: 0,
    shortDescription: {
      en: "Unsend bot message on emoji reaction"
    },
    longDescription: {
      en: "If anyone reacts to bot's message with 😾, 😡, 😠 etc, bot will auto delete its message"
    },
    category: "auto"
  },

  onStart: async function () {
    // Required for command to load
  },

  onReaction: async function ({ api, event }) {
    try {
      const botID = api.getCurrentUserID();
      const reaction = event.reaction;

      // Customize which emojis trigger deletion
      const deleteEmojis = ["😾", "😡", "😠", "🤬", "👿", "😤"];

      // Only unsend if message is from bot & reaction is matched
      if (event.userID !== botID && deleteEmojis.includes(reaction)) {
        // Get message info to check sender
        api.getMessageInfo(event.messageID, (err, info) => {
          if (err) return console.error("Failed to get message info:", err);
          if (info.senderID === botID) {
            api.unsendMessage(event.messageID);
          }
        });
      }
    } catch (e) {
      console.log("⚠️ reactdelete error:", e);
    }
  }
};
