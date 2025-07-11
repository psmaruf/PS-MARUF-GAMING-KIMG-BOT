module.exports = {
	config: {
		name: "hvd",
		aliases: ["hvdo"],
		version: "1.0",
		author: "RAHAD",
		countDown: 60,
		role: 0,
		shortDescription: "get hentai video",
		longDescription: "it will send hentai video",
		category: "𝟭𝟴+",
		guide: "{p}{n}hvdo",
	},

	sentVideos: [],

	onStart: async function ({ api, event, message }) {
		const senderID = event.senderID;

		const loadingMessage = await message.reply({
			body: "🔞 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐑𝐚𝐧𝐝𝐨𝐦 𝐅𝐮Ç𝐤 𝐕𝟏𝐝𝟑𝟎... 𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭! 𝐮𝐩𝐭𝐨 𝟓𝐦𝐢𝐧 🤡𝐑𝐀𝐇𝐀𝐃💦",
		});

		const link = [
			"https://drive.google.com/uc?export=download&id=1-eEaxo31GJjD_pxY1XWwVbIbPpOYBCDA",
			"https://drive.google.com/uc?export=download&id=1-iPK9Ir1W1XC68gb8xBrdim79DcpIzzA",
			"https://drive.google.com/uc?export=download&id=102PQNMmJZddWO_XOHznfiNPcd0NQNmdI",
			"https://drive.google.com/uc?export=download&id=10YYITO_VD24NpJPGQuzAgqxf7zKn2cCJ",
			"https://drive.google.com/uc?export=download&id=10RwnJFCxykWKm7XR5QmqKJak5bhPGEhd",
			"https://drive.google.com/uc?export=download&id=10GdwpB0XM8dl7IzdYS3MR70AUafaS-NV",
			"https://drive.google.com/uc?export=download&id=109xA5YT8-VTzsGnFnWdg7wjxEX5C-IFO",
			"https://drive.google.com/uc?export=download&id=1041yhV0yRJY8Dh3kcrH2m9kpJdSaVZCf",
			"https://drive.google.com/uc?export=download&id=103j57rh9qHjy8GQFQ4q4RpzzGND9NN-F",
			"https://drive.google.com/uc?export=download&id=103R6dyFRXlrfOoCXv1AF_o-tWVoA12_T",
			"https://drive.google.com/uc?export=download&id=10l35Ms1oW7rTi-E5_GrcYRphzC_y68hl"
		];

		let availableVideos = link.filter(video => !this.sentVideos.includes(video));

		if (availableVideos.length === 0) {
			this.sentVideos = [];
			availableVideos = link;
		}

		const randomVideo = availableVideos[Math.floor(Math.random() * availableVideos.length)];
		this.sentVideos.push(randomVideo);

		try {
			await message.reply({
				body: "💔 𝐋𝐨 𝐭𝐨𝐫 𝐭𝐨 💀 𝐆𝐅 𝐚𝐫 𝐁𝐨𝐮 🥀 𝐧𝐚𝐢... 𝐭𝐚𝐢 🤤 𝐄𝐍𝐉𝐎𝐘 𝐊𝐎𝐑 🫵🍑🔥",
				attachment: await global.utils.getStreamFromURL(randomVideo),
			});
		} catch (err) {
			await message.reply("⚠️ Failed to load the video. Link might be broken or removed.");
		}

		setTimeout(() => {
			if (loadingMessage?.messageID) {
				api.unsendMessage(loadingMessage.messageID);
			}
		}, 5000);
	},
};
