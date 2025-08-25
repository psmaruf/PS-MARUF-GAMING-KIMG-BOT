const axios = require("axios");

module.exports = {
  config: {
    name: "hindi",
    version: "1.0.1",
    author: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    countDown: 5,
    role: 0,
    shortDescription: "Text translation",
    longDescription: "Translate any text to Hindi",
    category: "media",
    guide: "{pn} [Text] -> [Language]"
  },

  onStart: async function ({ api, event, args }) {
    let content = args.join(" ");
    if (!content && event.type !== "message_reply") {
      return api.sendMessage("कृपया कोई टेक्स्ट प्रदान करें!", event.threadID, event.messageID);
    }

    let translateThis = content.split(" -> ")[0];
    let lang = content.includes(" -> ") ? content.split(" -> ")[1] : "hi";

    if (event.type === "message_reply") {
      translateThis = event.messageReply.body;
      lang = content.includes("-> ") ? content.split("-> ")[1] : "hi";
    }

    try {
      let res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(translateThis)}`
      );
      let translatedText = res.data[0].map(item => item[0]).join("");
      let fromLang = res.data[2] === res.data[8][0][0] ? res.data[2] : res.data[8][0][0];

      api.sendMessage(` ${translatedText}\n - 🍂🍂 ${fromLang} to Hindi 🍂🍂`, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage("अनुवाद के दौरान एक त्रुटि हुई!", event.threadID, event.messageID);
    }
  }
};
