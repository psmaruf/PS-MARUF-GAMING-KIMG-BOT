const axios = require('axios');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${query}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  config: {
    name: "anisearch",
    aliases: ["animeedit", "animevid"],
    author: "Rahad",
    version: "1.1",
    shortDescription: {
      en: "Search and fetch anime edit TikTok videos",
    },
    longDescription: {
      en: "Search for anime edit videos on TikTok and send them with a stylish message format",
    },
    category: "media",
    guide: {
      en: "{p}{n} <search keywords>",
    },
  },

  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("💥", event.messageID, () => {}, true);

    const rawQuery = args.join(" ").trim();
    if (!rawQuery) {
      return api.sendMessage("❗ Please enter keywords to search anime edits.", event.threadID, event.messageID);
    }

    const query = `${rawQuery} anime edit`;
    const videos = await fetchTikTokVideos(query);

    if (!videos || videos.length === 0) {
      return api.sendMessage(`❌ Sorry, no anime edit videos found for:\n» ${rawQuery}`, event.threadID, event.messageID);
    }

    const video = videos[Math.floor(Math.random() * videos.length)];
    if (!video.videoUrl) {
      return api.sendMessage("⚠️ Error: Couldn't find a valid video URL.", event.threadID, event.messageID);
    }

    try {
      const videoStream = await getStreamFromURL(video.videoUrl);

      const message = `
╭─『 𝙍𝘼𝙃𝘼𝘿 𝘼𝗻𝗶𝗺𝗲 𝗘𝗱𝗶𝘁 ─╮
📌 𝗦𝗲𝗮𝗿𝗰𝗵: ${rawQuery}
🎞️ 𝗩𝗶𝗱𝗲𝗼 𝗧𝗶𝘁𝗹𝗲: ${video.title || "N/A"}
🌟 𝗩𝗶𝗲𝘄𝘀: ${video.viewCount || "Unknown"}
╰───── 𝗥𝗔𝗛𝗔𝗗 𝗕𝗢𝗧 ───╯
      `;

      await api.sendMessage(
        {
          body: message,
          attachment: videoStream,
        },
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.error(error);
      api.sendMessage("❗ Error occured while fetching the video. Try again later.", event.threadID, event.messageID);
    }
  },
};
