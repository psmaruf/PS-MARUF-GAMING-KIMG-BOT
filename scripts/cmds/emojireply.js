module.exports = {
  config: {
    name: "emojiReply",
    version: "2.1",
    author: "Your Name",
    description: "Funny emoji-based auto-reply",
    category: "no prefix",
    cooldown: 3
  },

  // This ensures the bot loads the functionality immediately
  onStart: async function ({ api }) {
    // Nothing needs to be done here, as the logic is within onChat
    console.log("EmojiReply command loaded and ready to respond.");
  },

  onChat: async function ({ api, event }) {
    const { threadID, body } = event;

    if (!body) return;

    // Message me se sirf emojis nikalna
    const emojiMatch = body.match(/[\p{Emoji}]/gu);
    if (!emojiMatch) return;

    // Pehle emoji ka reply dena
    const emoji = emojiMatch[0];

    // Funny emoji replies
    const emojiReplies = {
      "😘": [
        "Arre babu, itna pyaar! Dil garden garden ho gaya! 🌸😂",
        "Mwah mwah! Yeh kaunsa naye pyaar ka signal hai? 💋😂",
        "Bas kar babu, sharm aayegi! 🙈💖",
        "Lagta hai babu full romantic mode me hai! 💞🔥"
      ],
      "😒": [
        "Ye kya nakhre hai babu? Shahzada mode on hai kya? 👑😂",
        "Itni attitude? Lagta hai data pack khatam ho gaya! 📵😆",
        "Babu, aise muh mat bana, varna statue ban jayega! 🗿😂",
        "Ladka full ignore mode me chala gaya! 🚶‍♂️😒"
      ],
      "👀": [
        "Aankhon se laser nikal rahi hai kya? 🔥👀",
        "Kya dekh raha hai babu? Free show nahi hai yeh! 🎭😂",
        "Ladki ya meme? Kis pe nazar hai babu? 👀😏",
        "Aankhon me plan dikh raha hai! Kya scheme chal rahi hai? 🤔😂"
      ],
      "😈": [
        "Babu full shaitani mode me hai! Aaj kiski class lagane wala hai? 👹🔥",
        "Lagta hai kisi ke dimaag me khatarnaak plan chal raha hai! 😈😏",
        "Yeh hasi bata rahi hai kuch to gadbad hai babu! 🧐😂",
        "Babu villain banne ka plan hai kya? 😆🔥"
      ],
      "💋": [
        "Arre wah, babu romance mode me hai! Bollywood hero ban raha kya? 💖😂",
        "Itni lip emoji? Lagta hai babu full love zone me hai! 💋🔥",
        "Kiss dete jao, pyar badhate jao! 😘😂",
        "Bas kar babu, ab to film ban jayegi! 🎬💋"
      ],
      "🥶": [
        "Babu fridge me beth gaya kya? AC band kar warna ice cube ban jayega! 🧊😂",
        "Itni thand? Snowman bhi sharma gaya! ⛄😆",
        "Lagta hai kisi ne direct Antarctica bhej diya! ❄️😂",
        "Thand se hil raha hai ya DJ pe nach raha hai? 🕺🥶"
      ],
      "😹": [
        "Billi bhi hasi se gutargun kar rahi hai! Meow meow stand-up comedy dekh rahi hai kya? 🐈😂",
        "Billi bhi memes dekhne lagi hai! Pura comedy ka mahaul hai! 😹🎭",
        "Lagta hai kisi ne billi ko bhi joke suna diya! 🤣🐱",
        "Billi ka bhi hasna valid hai, memes ka zamana hai! 😹📱"
      ],
      "👊": [
        "Babu full fighting mode me hai! 🥊🔥",
        "Abe yeh kya, boxing ring me aa gaya kya? 🤜💥",
        "Arre chill kar, mukka maarne se problem solve nahi hoti! 🤕😂",
        "Lagta hai kisi ko thoda sudharne ka plan hai! 🧐👊"
      ],
      "😁": [
        "Babu full khush lag raha hai! Koi special baat hai kya? 😁🎉",
        "Itni badi smile? Lagta hai chhupa treasure mil gaya! 🏆😁",
        "Babu ke dant chamak rahe hain! Kya toothpaste use karte ho? 🦷😂",
        "Hasi aise hi bani rahe! Dunia ko positive energy milti rahe! 😁💖"
      ]
    };

    if (emojiReplies[emoji]) {
      const replies = emojiReplies[emoji];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      return api.sendMessage(randomReply, threadID);
    }
  }
};
