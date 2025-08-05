const axios = require('axios');
const baseApiUrl = async () => {
  return "https://www.noobs-api.rf.gd/dipto";
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe"],
  version: "6.9.0",
  author: "dipto + chatgpt update",
  countDown: 0,
  role: 0,
  description: "better than all sim simi",
  category: "chat",
  guide: {
    en: "{pn} [message] OR\nteach [text] - [reply1, reply2] OR\nteach react [text] - [emoji1, emoji2] OR\nremove [text] OR\nrm [text] - [index] OR\nmsg [text] OR\nlist OR\nlist all OR\nedit [text] - [newReply]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const link = `${await baseApiUrl()}/baby`;
  const dipto = args.join(" ").toLowerCase();
  const uid = event.senderID;
  let command, comd, final;

  try {
    if (!args[0]) {
      const randomReplies = [
        "『😚』𝑯𝒆 𝒃𝒂𝒃𝒚~ 𝒃𝒐𝒍𝒐 𝒌𝒊 𝒄𝒉𝒂𝒊? 🥺",
        "『😎』𝑻𝒖𝒎𝒊 𝒏𝒂 𝒃𝒐𝒍𝒍𝒆 𝒂𝒎𝒂𝒓 𝒅𝒊𝒏 𝒔𝒖𝒏𝒏𝒐 𝒍𝒂𝒈𝒆 😔",
        "『💅』𝑨𝒎𝒊 𝒃𝒆𝒃𝒚, 𝒕𝒖𝒎𝒊 𝒃𝒐𝒍𝒍𝒆 𝒋𝒐𝒘𝒂𝒍𝒂 𝒉𝒂𝒎𝒍𝒂 করবো 💣",
        "『🤭』𝑶𝒉 𝒉𝒂𝒚, 𝒕𝒖𝒎𝒊 𝒕𝒐 𝒆𝒌𝒅𝒐𝒎 𝒋𝒂𝒏𝒖 𝒍𝒆𝒗𝒆𝒍 😘",
      ];
      return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, event.messageID);
    }

    // Remove
    if (args[0] === 'remove') {
      const fina = dipto.replace("remove ", "");
      const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
      return api.sendMessage(dat, event.threadID, event.messageID);
    }

    if (args[0] === 'rm' && dipto.includes('-')) {
      const [fi, f] = dipto.replace("rm ", "").split(' - ');
      const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
      return api.sendMessage(da, event.threadID, event.messageID);
    }

    // List
    if (args[0] === 'list') {
      if (args[1] === 'all') {
        const data = (await axios.get(`${link}?list=all`)).data;
        const teachers = await Promise.all(data.teacher.teacherList.map(async (item) => {
          const number = Object.keys(item)[0];
          const value = item[number];
          const name = (await usersData.get(number)).name;
          return { name, value };
        }));
        teachers.sort((a, b) => b.value - a.value);
        const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
        return api.sendMessage(`📚 মোট শেখানো: ${data.length}\n👑 শিখিয়েছেন:\n${output}`, event.threadID, event.messageID);
      } else {
        const d = (await axios.get(`${link}?list=all`)).data.length;
        return api.sendMessage(`🧠 মোট শেখানো মেসেজ: ${d}`, event.threadID, event.messageID);
      }
    }

    // Message details
    if (args[0] === 'msg') {
      const fuk = dipto.replace("msg ", "");
      const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
      return api.sendMessage(`📝 মেসেজ: ${fuk} = ${d}`, event.threadID, event.messageID);
    }

    // Edit
    if (args[0] === 'edit') {
      const command = dipto.split(' - ')[1];
      if (!command || command.length < 2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
      const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
      return api.sendMessage(`✅ পরিবর্তন সফল: ${dA}`, event.threadID, event.messageID);
    }

    // Teach
    if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
      [comd, command] = dipto.split(' - ');
      final = comd.replace("teach ", "");
      if (!command || command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
      const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}`);
      const tex = re.data.message;
      const teacher = (await usersData.get(re.data.teacher)).name;
      return api.sendMessage(`✅ শেখানো হয়েছে: ${tex}\n👤 শিক্ষক: ${teacher}\n📚 মোট: ${re.data.teachs}`, event.threadID, event.messageID);
    }

    if (args[0] === 'teach' && args[1] === 'amar') {
      [comd, command] = dipto.split(' - ');
      final = comd.replace("teach ", "");
      if (!command || command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
      const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
      return api.sendMessage(`✅ ব্যক্তিগত মেসেজ শেখানো হয়েছে: ${tex}`, event.threadID, event.messageID);
    }

    if (args[0] === 'teach' && args[1] === 'react') {
      [comd, command] = dipto.split(' - ');
      final = comd.replace("teach react ", "");
      if (!command || command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
      const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
      return api.sendMessage(`✅ রিঅ্যাকশন শেখানো হয়েছে: ${tex}`, event.threadID, event.messageID);
    }

    if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
      const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
      return api.sendMessage(data, event.threadID, event.messageID);
    }

    const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
    api.sendMessage(d, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        d,
        apiUrl: link
      });
    }, event.messageID);

  } catch (e) {
    console.log(e);
    api.sendMessage("❌ | কোনো সমস্যা হয়েছে, কনসোলে দেখো!", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  try {
    if (event.type == "message_reply") {
      const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
      await api.sendMessage(a, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          a
        });
      }, event.messageID);
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event, message }) => {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("bot") || body.startsWith("jan") || body.startsWith("babu") || body.startsWith("janu")) {
      const arr = body.replace(/^\S+\s*/, "");
      const replies = [
        "『😚』𝑯𝒆 𝒃𝒂𝒃𝒚~ 𝒃𝒐𝒍𝒐 𝒌𝒊 𝒄𝒉𝒂𝒊? 🥺",
        "『🥵』𝒕𝒖𝒎𝒊 𝒃𝒐𝒍𝒍𝒆 𝒂𝒎𝒊 𝒑𝒉𝒖𝒍𝒆 𝒈𝒆𝒍𝒂𝒎 😳💦",
        "『😈』𝑻𝒐𝒓 𝒎𝒐𝒕𝒐 𝒃𝒂𝒃𝒚 𝒕𝒐 𝒎𝒊𝒏𝒊𝒔𝒕𝒓𝒚 𝒕𝒆 𝒏𝒂𝒊 😈🌺",
      ];
      if (!arr) {
        await api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }, event.messageID);
      } else {
        const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
        await api.sendMessage(a, event.threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            a
          });
        }, event.messageID);
      }
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};
