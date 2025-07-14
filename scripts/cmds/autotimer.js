module.exports.config = {
  name: "autotimer",
  version: "2.0",
  role: 0,
  author: "Dipto",
  description: "সেট করা সময় অনুযায়ী স্বয়ংক্রিয়ভাবে বার্তাগুলি পাঠানো হবে!",
  category: "AutoTime",
  countDown: 3,
};

module.exports.onLoad = async ({ api }) => {
  const timerData = {
    "12:00:00 PM": {
      message: "This is an auto schedule message at 12:00 PM 🌞 🌟",
    },
    "01:00:00 AM": {
      message: "This is an auto schedule message at 01:00 AM 🌜 🌟",
    },
    "02:00:00 AM": {
      message: "This is an auto schedule message at 02:00 AM 🌜 🌟",
    },
    "03:00:00 AM": {
      message: "This is an auto schedule message at 03:00 AM 🌜 🌟",
    },
    "04:00:00 AM": {
      message: "This is an auto schedule message at 04:00 AM 🌜 🌟",
    },
    "05:00:00 AM": {
      message: "This is an auto schedule message at 05:00 AM 🌜 🌟",
    },
    "06:00:00 AM": {
      message: "This is an auto schedule message at 06:00 AM 🌜 🌟",
    },
    "07:00:00 AM": {
      message: "This is an auto schedule message at 07:00 AM 🌜 🌟",
    },
    "08:00:00 AM": {
      message: "This is an auto schedule message at 08:00 AM 🌜 🌟",
    },
    "09:00:00 AM": {
      message: "This is an auto schedule message at 09:00 AM 🌜 🌟",
    },
    "10:00:00 AM": {
      message: "This is an auto schedule message at 10:00 AM 🌞 🌟",
    },
    "11:00:00 AM": {
      message: "This is an auto schedule message at 11:00 AM 🌞 🌟",
    },
    "01:00:00 PM": {
      message: "This is an auto schedule message at 01:00 PM 🌞 🌟",
    },
    "02:00:00 PM": {
      message: "This is an auto schedule message at 02:00 PM 🌞 🌟",
    },
    "03:00:00 PM": {
      message: "This is an auto schedule message at 03:00 PM 🌞 🌟",
    },
    "04:00:00 PM": {
      message: "This is an auto schedule message at 04:00 PM 🌞 🌟",
    },
    "05:00:00 PM": {
      message: "This is an auto schedule message at 05:00 PM 🌞 🌟",
    },
    "06:00:00 PM": {
      message: "This is an auto schedule message at 06:00 PM 🌞 🌟",
    },
    "07:00:00 PM": {
      message: "This is an auto schedule message at 07:00 PM 🌜 🌟",
    },
    "08:00:00 PM": {
      message: "This is an auto schedule message at 08:00 PM 🌜 🌟",
    },
    "09:00:00 PM": {
      message: "This is an auto schedule message at 09:00 PM 🌜 🌟",
    },
    "10:00:00 PM": {
      message: "This is an auto schedule message at 10:00 PM 🌜 🌟",
    },
    "11:00:00 PM": {
      message: "This is an auto schedule message at 11:00 PM 🌜 🌟",
    }
  };

  // 🎥 র‍্যান্ডম ভিডিও লিস্ট (attachment ID format বা Buffer stream format ব্যবহার করা যাবে)
  const videoURLs = [
    "https://drive.google.com/uc?export=download&id=10fnG0B9mjJm7kiOfhCmxaWJAnO6byg7h",
    "https://drive.google.com/uc?export=download&id=10bLixrdA5AMDX_ghc0gh2KrNqFnlXCWt",
    "https://drive.google.com/uc?export=download&id=10yCXj_k-vQ3JZ4CDBI47q1QAGStgqGGf",
    "https://drive.google.com/uc?export=download&id=10tylA-0PZt29bEwbMQliFJRLyNgpUSPy",
    "https://drive.google.com/uc?export=download&id=10sOdM79rUWrUCUTt2bshWk5UJjDFZuzB",
    "https://drive.google.com/uc?export=download&id=10igHuFfPMYdAXE5jHJg7E1Bg_EmNbsxp",
    "https://drive.google.com/uc?export=download&id=10hN25pp9xP3ta7-nRxqRDeqRDYSQsi8t"
  ];

  const checkTimeAndSendMessage = async () => {
    const currentTime = new Date(Date.now() + 21600000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).split(',').pop().trim();

    if (timerData[currentTime]) {
      const randomURL = videoURLs[Math.floor(Math.random() * videoURLs.length)];
      try {
        const attachment = await global.utils.getStreamFromURL(randomURL);

        global.GoatBot.config.whiteListModeThread.whiteListThreadIds.forEach(async threadID => {
          await api.sendMessage({
            body: timerData[currentTime].message,
            attachment
          }, threadID);
        });
      } catch (e) {
        console.error("❌ ভিডিও আনতে সমস্যা:", e);
      }
    }

    setTimeout(checkTimeAndSendMessage, 1200 - new Date().getMilliseconds());
  };

  checkTimeAndSendMessage();
};

module.exports.onStart = ({}) => {};
