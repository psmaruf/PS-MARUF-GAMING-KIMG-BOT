module.exports = {
	config: {
		name: "status",
		aliases: ["sad"],
		version: "1.0",
		author: "Doru fix by kivv",
		countDown: 5,
		role: 0,
		shortDescription: "send short video",
		longDescription: "video",
		category: "status",
		guide: "{pn}"
	},

	onStart: async function ({ message }) {
	 var link = [ 
"https://drive.google.com/file/d/13yzDlAljtCqD4EXELn749I469Fbmrhw_/view?usp=drivesdk",
"https://drive.google.com/file/d/13zx92blzGvHJNKkCY_R74pi6f4-Ncuml/view?usp=drivesdk",
"https://drive.google.com/file/d/142UqYFPHPBQGBaob9Ww4L69yVsFGveLk/view?usp=drivesdk",
"https://drive.google.com/file/d/14ExzzeNdBqxqFpAgKsIgbER149txjrmI/view?usp=drivesdk",
"https://drive.google.com/file/d/13jT5TK9SzCYD38Le4rZPH6GGFrD5kZ-k/view?usp=drivesdk",
"https://drive.google.com/file/d/13pNe5zEBonekwnqg0xQl4xvfPnTI8xkO/view?usp=drivesdk",
"https://drive.google.com/file/d/13qvBDp6_IlECWuraUXubZ1mzKOLMg-Sl/view?usp=drivesdk",
	]
let img = link[Math.floor(Math.random()*link.length)]
message.send({
	body: 'I don't need anybody  ',attachment: await global.utils.getStreamFromURL(video)
})
}
}
