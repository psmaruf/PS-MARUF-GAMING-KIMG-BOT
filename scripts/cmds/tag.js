const config = {
  name: "tag",
  version: "1.6.9",
  author: "BaYjid",
  credits: "BaYjid",
  countDown: 0,
  role: 0,
  hasPermission: 0,
  description: "Tag a user with style",
  category: "tag",
  commandCategory: "tag",
  guide: "{pn} [reply or mention UID] [message]",
  usages: "reply or mention"
};

const onStart = async ({ api, args, event }) => {
  try {
    const ID = event.messageReply?.senderID || args[0] || event.senderID;
    const mentionedUser = await api.getUserInfo(ID);

    if (mentionedUser && mentionedUser[ID]) {
      let userName = mentionedUser[ID].name || `Facebook User (${ID})`;

      // 👻 Optional roast mode for ghost users (uncomment if you dare)
      // if (userName.includes("Facebook User")) {
      //   userName = `👻 Ghost User (ID: ${ID})`;
      // }

      // Remove the UID from args if it was passed directly
      const text = event.messageReply
        ? args.join(" ")
        : args.slice(1).join(" ") || "";

      await api.sendMessage({
        body: `${userName} ${text}`.trim(),
        mentions: [{
          tag: userName,
          id: ID
        }]
      }, event.threadID, event.messageID);
    } else {
      api.sendMessage("⚠️ Reply to a message or provide a valid UID to tag.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
  }
};

module.exports = {
  config,
  onStart,
  run: onStart
};