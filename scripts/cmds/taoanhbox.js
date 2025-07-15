module.exports.config = {
  name: "taoanhbox",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "shion - modified by Bayjid & ChatGPT",
  description: "Create an image of all members in the group chat",
  commandCategory: "group",
  usages: "taoanhbox [size] [#hexcolor] [title]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": "",
    "jimp": "",
    "node-superfetch": "",
    "chalk": ""
  }
};

module.exports.circle = async (image) => {
  const jimp = global.nodemodule["jimp"];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api, args }) => {
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const Canvas = global.nodemodule["canvas"];
  const superfetch = global.nodemodule["node-superfetch"];
  const { threadID, messageID } = event;
  const img = new Canvas.Image();

  let live = [], admin = [], i = 0;

  if (args[0] === "help" || args[0] === "0" || args[0] === "-h") {
    return api.sendMessage(
      `📌 Usage: taoanhbox <size> <#color> <title>\n` +
      `- size: avatar size\n` +
      `- #color: text color in hex (optional)\n` +
      `- title: image title (optional)\n\n` +
      `🧪 Example: taoanhbox 200 #ffffff Family Forever\nIf blank, defaults will be used.`,
      threadID, messageID
    );
  }

  // FONT
  const fontPath = __dirname + `/cache/data/TUVBenchmark.ttf`;
  if (!fs.existsSync(fontPath)) {
    const fontData = (await axios.get(`https://drive.google.com/u/0/uc?id=1NIoSu00tStE8bIpVgFjWt2in9hkiIzYz&export=download`, { responseType: "arraybuffer" })).data;
    fs.outputFileSync(fontPath, Buffer.from(fontData, "utf-8"));
  }

  // BACKGROUND
  const backgrounds = [
    'https://i.imgur.com/P3QrAgh.jpg',
    'https://i.imgur.com/RueGAGI.jpg',
    'https://i.imgur.com/bwMjOdp.jpg',
    'https://i.imgur.com/trR9fNf.jpg'
  ];
  const background = await Canvas.loadImage(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
  const frame = await Canvas.loadImage("https://i.imgur.com/gYxZFzx.png");
  const bgX = background.width, bgY = background.height;
  const canvas = Canvas.createCanvas(bgX, bgY);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(background, 0, 0, bgX, bgY);

  // GROUP INFO
  const { participantIDs, adminIDs, name, userInfo } = await api.getThreadInfo(threadID);
  for (let ad of adminIDs) admin.push(ad.id);
  for (let user of userInfo) if (user.gender !== undefined) live.push(user);

  // SIZE / COLOR / TITLE SETUP
  const totalArea = bgX * (bgY - 200);
  const autoSize = Math.floor(Math.sqrt(Math.floor(totalArea / live.length)));
  const size = args[0] ? parseInt(args[0]) : autoSize;
  const color = args[1] || '#ffffff';
  const title = args.slice(2).join(" ") || name;

  let padding = parseInt(size / 15), x = padding, y = 200;
  const realSize = size - padding * 2;
  const cropWidth = live.length * realSize;
  let cropHeight = y + realSize;

  api.sendMessage(
    `📸 Generating image for ${participantIDs.length} members...\n🖼️ Background: ${bgX}x${bgY}\n👤 Avatar size: ${realSize}\n🎨 Text color: ${color}`,
    threadID, messageID
  );

  const path = __dirname + `/cache/${Date.now() + 10000}.png`;

  for (let user of live) {
    try {
      const avatarRes = await superfetch.get(`https://graph.facebook.com/${user.id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      if (x + realSize > bgX) {
        x = padding;
        y += realSize + padding;
        cropHeight += realSize + padding;
      }
      if (cropHeight > bgY) break;

      const circleAvatar = await module.exports.circle(avatarRes.body);
      const avatarImage = await Canvas.loadImage(circleAvatar);
      ctx.drawImage(avatarImage, x, y, realSize, realSize);
      if (admin.includes(user.id)) ctx.drawImage(frame, x, y, realSize, realSize);
      x += realSize + padding;
      i++;
    } catch (e) {
      continue;
    }
  }

  // TITLE TEXT
  Canvas.registerFont(fontPath, { family: "TUVBenchmark" });
  ctx.font = "100px TUVBenchmark";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(decodeURIComponent(title), cropWidth / 2, 133);

  const cut = await jimp.read(canvas.toBuffer());
  cut.crop(0, 0, cropWidth, cropHeight + padding - 30).writeAsync(path);
  await new Promise(r => setTimeout(r, 300));

  return api.sendMessage({
    body:
      `✅ Group image created!\n👥 Members rendered: ${i}\n🗑️ Skipped: ${participantIDs.length - i}`,
    attachment: fs.createReadStream(path)
  }, threadID, () => fs.unlinkSync(path), messageID);
};
