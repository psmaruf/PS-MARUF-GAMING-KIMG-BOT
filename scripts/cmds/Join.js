const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
	config: {
		name: "join",
		version: "2.0",
		author: "Rahad",
		countDown: 5,
		role: 0,
		shortDescription: "🌐 Join a group the bot is in",
		longDescription: "Lets a user join from a list of groups the bot is already in",
		category: "👑 Owner",
		guide: {
			en: "{p}{n} ➝ View and join available groups",
		},
	},

	onStart: async function ({ api, event }) {
		try {
			const groupList = await api.getThreadList(50, null, ['INBOX']);
			const filteredList = groupList.filter(group => group.threadName !== null);

			if (filteredList.length === 0) {
				return api.sendMessage("❌ No group chats found.", event.threadID);
			}

			const formattedList = filteredList.map((group, index) =>
				`🔹 ${index + 1}. 𝙂𝙧𝙤𝙪𝙥: ${group.threadName}\n    🆔 TID: ${group.threadID}\n    👥 Members: ${group.participantIDs.length}`
			);

			const message = `📋 𝙅𝙤𝙞𝙣 𝙂𝙧𝙤𝙪𝙥 𝙈𝙚𝙣𝙪\n━━━━━━━━━━━━━━━━━━\n${formattedList.join("\n━━━━━━━━━━━━━━━\n")}\n━━━━━━━━━━━━━━━━━━\n📌 Max Members per Group: 250\n\n📝 Reply to this message with the number (e.g., 1, 2) of the group you want to join.`;

			const sentMessage = await api.sendMessage(message, event.threadID);
			global.GoatBot.onReply.set(sentMessage.messageID, {
				commandName: 'join',
				messageID: sentMessage.messageID,
				author: event.senderID,
			});
		} catch (error) {
			console.error("🔧 Error listing group chats:", error);
			api.sendMessage(`❌ Error occurred while listing groups.\n${error.message}`, event.threadID);
		}
	},

	onReply: async function ({ api, event, Reply }) {
		const { author, messageID } = Reply;

		if (event.senderID !== author) return;

		const groupIndex = parseInt(event.body.trim(), 10);

		if (isNaN(groupIndex) || groupIndex <= 0) {
			return api.sendMessage('❌ Invalid input.\nPlease reply with a valid number.', event.threadID, event.messageID);
		}

		try {
			const groupList = await api.getThreadList(50, null, ['INBOX']);
			const filteredList = groupList.filter(group => group.threadName !== null);

			if (groupIndex > filteredList.length) {
				return api.sendMessage('⚠️ Invalid group number.\nTry a number within the shown range.', event.threadID, event.messageID);
			}

			const selectedGroup = filteredList[groupIndex - 1];
			const groupID = selectedGroup.threadID;

			const threadInfo = await api.getThreadInfo(groupID);

			if (threadInfo.participantIDs.includes(event.senderID)) {
				return api.sendMessage(`🚫 You are already in the group: "${selectedGroup.threadName}"`, event.threadID, event.messageID);
			}

			if (threadInfo.participantIDs.length >= 250) {
				return api.sendMessage(`🚫 The group "${selectedGroup.threadName}" is full (250 members).`, event.threadID, event.messageID);
			}

			await api.addUserToGroup(event.senderID, groupID);
			api.sendMessage(`✅ You have successfully joined the group: ✨ "${selectedGroup.threadName}" ✨`, event.threadID, event.messageID);

		} catch (error) {
			console.error("❌ Join Error:", error);
			api.sendMessage(`❌ Failed to join group.\n${error.message}`, event.threadID, event.messageID);
		} finally {
			global.GoatBot.onReply.delete(messageID);
		}
	}
};
