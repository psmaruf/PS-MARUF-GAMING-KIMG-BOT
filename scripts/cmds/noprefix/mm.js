
const fs = require("fs");
module.exports.config = {
  name: "mm",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Modified by ChatGPT",
  description: "No-prefix emoji trigger voice reply",
  commandCategory: "no prefix",
  usages: "emoji based trigger",
  cooldowns: 5,
};

module.exports.handleEvent = function({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const triggers = ["🙂", "😄", "hello 🙂", "hi 🙂"];
  const matched = triggers.some(trigger => body.toLowerCase().includes(trigger));

  if (matched) {
    const msg = {
      body: "Here's your voice reply! 🎧",
      attachment: fs.createReadStream(__dirname + "/xf.mp3")
    };
    api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("✅", event.messageID, () => {}, true);
  }
};

module.exports.run = function({ api, event }) {};
