const axios = require("axios");

const BOARD = {
  dhaka: "dhaka", dh: "dhaka",
  barisal: "barisal", ba: "barisal",
  chittagong: "chittagong", ctg: "chittagong",
  comilla: "comilla", com: "comilla",
  dinajpur: "dinajpur", din: "dinajpur",
  jessore: "jessore", jes: "jessore",
  mymensingh: "mymensingh", my: "mymensingh",
  rajshahi: "rajshahi", raj: "rajshahi",
  sylhet: "sylhet", syl: "sylhet",
  madrasah: "madrasah", mad: "madrasah",
  technical: "tec", tec: "tec",
  "dibs(dhaka)": "dibs", dibs: "dibs"
};

const EXAM = {
  "jsc/jdc": "jsc",
  "ssc/dakhil": "ssc",
  "ssc": "ssc",
  "ssc(vocational)": "ssc_voc",
  "hsc/alim/equivalent": "hsc",
  "hsc()": "hsc_voc",
  "hsc(bm)": "hsc_hbm",
  "diploma in commerce": "hsc_dic",
  "diploma in business studies": "hsc",
  "hsc": "hsc"
};

module.exports = {
  config: {
    name: "result",
    aliases: ["edu"],
    version: "2.4",
    author: "BaYjid",
    role: 0,
    description: "Check BD education board result.",
    category: "education",
    guide: {
      en: "{pn} <roll> | <reg> | <board> [| <year>] [| <exam=ssc>]"
    }
  },

  onStart: async function ({ message, args, commandName }) {
    const input = args.join(" ").split("|").map(i => i.trim());
    if (input.length < 3) {
      return message.reply(`❌ Usage:\n${commandName} <roll> | <reg> | <board> [| <year>] [| <exam=ssc>]`);
    }

    const roll = input[0];
    const reg = input[1];
    const rawBoard = input[2].toLowerCase();
    const year = input[3] || new Date().getFullYear().toString();
    const rawExam = input[4] || "ssc";

    const exam = EXAM[rawExam.toLowerCase()] || rawExam.toLowerCase();
    const board = BOARD[rawBoard];

    if (!exam) return message.reply(`❌ Unknown exam name: "${rawExam}". Please check spelling.`);
    if (!board) return message.reply(`❌ Unknown board: "${rawBoard}". Please check spelling.`);

    message.reply("🔍 Checking result, please wait...");

    try {
      const { data } = await axios.get(`${global.api.dipto}/result`, {
        params: { exam, board, roll, reg, year, key: "gaymudermarecdi" }
      });

      if (!data || !data.name) {
        return message.reply("❌ No result found. Please verify the information.");
      }

      const {
        name, father_name, mother_name, board: resBoard,
        group, dob, type, roll: resRoll, result: status,
        institute, gpa, year: examYear, subject_grades
      } = data;

      const subjectLines = subject_grades.map(
        s => `├ ${s.subjectName}: ${s.subjectGPA}`
      ).join("\n");

      const finalResult = `
╭──✦ [ 🧑 Student Information ]
├‣ 🪪 Name: ${name}
├‣ 👨‍👦 Father: ${father_name}
├‣ 👩‍👦 Mother: ${mother_name}
├‣ 🏫 Institute: ${institute}
├‣ 🎓 Board: ${resBoard.toUpperCase()}
├‣ 🧬 Group: ${group}
├‣ 🗓 Date of Birth: ${dob}
├‣ 🆔 Roll Number: ${resRoll}
├‣ 📅 Exam Year: ${examYear}
├‣ 📌 Type: ${type}
╰─────────────────────────────
╭──✦ [ 🎯 Result Summary ]
├‣ 📊 GPA: ${gpa}
├‣ ✅ Status: ${status}
╰─────────────────────────────
╭──✦ [ 📚 Subject-wise Grades ]
${subjectLines}
╰─────────────────────────────
`.trim();

      message.reply(finalResult);
    } catch (err) {
      console.error(err);
      message.reply("❌ Server error occurred. Please try again later.");
    }
  }
};