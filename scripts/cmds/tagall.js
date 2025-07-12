module.exports = {
  config: {
    name: "tagall",
    aliases: ["everyone", "ping"],
    role: 0,
    shortDescription: "Mention everyone in the group",
    category: "group"
  },
  onStart: async function ({ api, event }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs;

    const mentions = members.map(id => ({
      id,
      tag: '👤'
    }));

    api.sendMessage({
      body: "🔔 Calling everyone!",
      mentions
    }, event.threadID);
  }
};
