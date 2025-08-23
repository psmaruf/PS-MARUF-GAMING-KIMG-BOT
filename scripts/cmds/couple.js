const Canvas = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
	config: {
		name: "couple",
		version: "1.3",
		author: "Rahad",
		countDown: 5,
		role: 0,
		shortDescription: "Couple image with custom background",
		longDescription: "Couple image with your own background, avatars cropped in circles",
		category: "image",
		guide: {
			en: "{pn} @tag"
		}
	},

	langs: {
		en: { noTag: "You must tag the person you want to couple" },
		vi: { noTag: "Bạn phải tag người bạn muốn ghép đôi" }
	},

	onStart: async function ({ event, message, usersData, args, getLang }) {
		const uid1 = event.senderID;
		const uid2 = Object.keys(event.mentions)[0];

		if (!uid2) return message.reply(getLang("noTag"));

		const avatarURL1 = await usersData.getAvatarUrl(uid1);
		const avatarURL2 = await usersData.getAvatarUrl(uid2);

		// Load background
		const background = await Canvas.loadImage("https://i.imgur.com/hmKmmam.jpg");

		// Load avatars
		const avatar1 = await Canvas.loadImage(avatarURL1);
		const avatar2 = await Canvas.loadImage(avatarURL2);

		// Create canvas
		const canvas = Canvas.createCanvas(background.width, background.height);
		const ctx = canvas.getContext("2d");

		// Draw background
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		// Draw avatars as circles
		const drawCircle = (img, x, y, size) => {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(img, x, y, size, size);
			ctx.restore();
		};

		const avatarSize = 200; // same size as original style
		// Position avatars same as previous template
		drawCircle(avatar1, 527, 141, avatarSize);
		drawCircle(avatar2, 389, 407, avatarSize);

		// Save image
		const pathSave = `${__dirname}/tmp/${uid1}_${uid2}_Couple.png`;
		const buffer = canvas.toBuffer("image/png");
		fs.writeFileSync(pathSave, buffer);

		const content = args.join(' ').replace(Object.keys(event.mentions)[0], "");
		message.reply({
			body: content || "Lovely 💕",
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};
