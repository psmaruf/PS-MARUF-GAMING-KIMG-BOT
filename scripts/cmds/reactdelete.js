module.exports = {
  config: {
    name: "reactdelete",
    version: "1.0",
    author: "Father Rahad",
    role: 0,
    shortDescription: {
      en: "Delete message if reacted with 😾"
    },
    longDescription: {
      en: "Automatically delete bot's message if someone reacts with 😾"
    },
    category: "auto"
  },

  onStart: async function () {
    // Required for load, even if empty
  },

  onReaction: async function ({ api, event }) {
    try {
      const reaction = event.reaction;
      const botID = api.getCurrentUserID();

      // If bot sent the message, and someone reacted with 😾
      if (reaction === "😾" && event.userID !== botID) {
        await api.unsendMessage(event.messageID);
      }
    } catch (e) {
      console.log("ReactDelete Error:", e);
    }
  }
};
