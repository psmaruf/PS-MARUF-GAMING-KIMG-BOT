/**
 * AutoMod (Goat Bot V2) — NSFW/Violence/Horror media auto-kick
 * -------------------------------------------------------------
 * কী করে:
 *  - গ্রুপে কেউ 18+ বা হিংস্র/হরর টাইপ ছবি/ভিডিও দিলে অটো-কিক/ওয়ার্ন
 *  - থ্রেড-ভিত্তিক সেটিংস: on/off, action=kick|warn, strikes limit, ক্যাটাগরি ফিল্টার
 *  - বেসিক ডিটেকশন: ফাইলনেম/URL কীওয়ার্ড, মেসেজ টেক্সট কীওয়ার্ড
 *  - (ঐচ্ছিক) Advanced image NSFW: nsfwjs + @tensorflow/tfjs-node ইনস্টল থাকলে অটো-ব্যবহার
 *
 * ইনস্টল (ঐচ্ছিক, বেশি একিউরেট):
 *   npm i nsfwjs @tensorflow/tfjs-node
 *
 * কমান্ড ইউজ:
 *   automod on
 *   automod off
 *   automod action kick|warn
 *   automod strikes <number>         (warn মোডে কত বার পরে কিক)
 *   automod categories nsfw,on | violence,on | horror,on  (কমা দিয়ে একাধিক)
 *   automod status
 *
 * নোট:
 *  - কিক করতে হলে বটকে গ্রুপ অ্যাডমিন হতে হবে।
 *  - ভিডিওতে advanced স্ক্যান অফ—শুধু কীওয়ার্ড/মেটাডেটা চেক; চাইলে পরে ffmpeg ফ্রেম স্যাম্পল যোগ করতে পারবেন।
 */

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

let nsfwLib = null;
let tf = null;
(async () => {
  try {
    tf = require("@tensorflow/tfjs-node");
    nsfwLib = require("nsfwjs");
  } catch (_) {
    // ঐচ্ছিক ডিপেন্ডেন্সি নাই — বেসিক মোডে চলবে
  }
})();

const DB_DIR = path.join(__dirname, "..", "data", "automod");
const DB_PATH = path.join(DB_DIR, "store.json");

// ডিফল্ট সেটিংস
const defaultThreadConfig = () => ({
  enabled: true,
  action: "kick",           // "kick" | "warn"
  strikesLimit: 2,          // warn হলে কতগুলো ওয়ার্ন পরে কিক
  categories: {             // কোন ক্যাটাগরি ব্লক হবে
    nsfw: true,
    violence: true,
    horror: true
  },
  strikes: {}               // userID => count
});

function nowBD() {
  // Bangladesh time, 12-hour format
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    hour12: true
  });
}

function loadDB() {
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    return fs.readJsonSync(DB_PATH);
  } catch (e) {
    return {};
  }
}

function saveDB(db) {
  fs.ensureDirSync(DB_DIR);
  fs.writeJsonSync(DB_PATH, db, { spaces: 2 });
}

function getThread(db, threadID) {
  if (!db[threadID]) db[threadID] = defaultThreadConfig();
  return db[threadID];
}

const KEYWORDS = {
  nsfw: [
    "nsfw","xxx","nude","nudity","boobs","bra","panty","sex","porn","horny","bdsm","cock","dick","cum","bhabhi","desisex","hotvideo","xvideo","xvideos","xnxx"
  ],
  violence: [
    "gore","blood","beheading","murder","shooting","knife","stab","kill","deadbody","corpse","gunfight"
  ],
  horror: [
    "horror","ghost","jumpscare","creepy","disturbing","scaryface","demonic","possession"
  ]
};

// বেসিক চেক: টেক্সট+URL/ফাইলনেমে কীওয়ার্ড
function basicMatch(text = "", url = "", filename = "") {
  const lower = (text + " " + url + " " + filename).toLowerCase();

  const hit = { nsfw: false, violence: false, horror: false };
  for (const k of KEYWORDS.nsfw) if (lower.includes(k)) { hit.nsfw = true; break; }
  for (const k of KEYWORDS.violence) if (lower.includes(k)) { hit.violence = true; break; }
  for (const k of KEYWORDS.horror) if (lower.includes(k)) { hit.horror = true; break; }

  return hit;
}

// ইমেজ ডাউনলোড
async function downloadToBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

// (ঐচ্ছিক) NSFWJS দিয়ে ইমেজ ক্লাসিফাই
async function nsfwClassifyImage(buffer) {
  if (!nsfwLib || !tf) return null;

  const imageTensor = tf.node.decodeImage(buffer, 3);
  const model = await nsfwLib.load(); // ডিফল্ট মডেল
  const predictions = await model.classify(imageTensor);
  imageTensor.dispose();
  return predictions; // [{className, probability}, ...]
}

function decideByPredictions(preds) {
  if (!preds) return { nsfw: false, violence: false, horror: false };

  // nsfwjs className: "Neutral" | "Drawing" | "Sexy" | "Porn" | "Hentai"
  const score = Object.fromEntries(preds.map(p => [p.className, p.probability || 0]));
  const nsfw = (score.Porn || 0) > 0.6 || (score.Sexy || 0) > 0.75 || (score.Hentai || 0) > 0.65;
  // nsfwjs এ violence/horror নাই — এগুলো বেসিক কীওয়ার্ড দিয়েই ধরছি
  return { nsfw, violence: false, horror: false };
}

async function handleAction({ api, event, cfg, hitCategories }) {
  const { threadID, senderID } = event;

  const title = "⚠️ 𝘼𝙪𝙩𝙤𝙈𝙤𝙙 𝙂𝙪𝙖𝙧𝙙";
  const timeStr = nowBD();

  const hitList = Object.entries(hitCategories)
    .filter(([_, v]) => v && cfg.categories[_])
    .map(([k]) => k.toUpperCase());

  if (hitList.length === 0) return;

  if (cfg.action === "kick") {
    try {
      await api.removeUserFromGroup(senderID, threadID);
      await api.sendMessage(
        `╔═══ ${title} ═══╗
• Reason: ${hitList.join(" + ")}
• Action: KICKED
• Time (BD): ${timeStr}
╚══════════════════╝`,
        threadID
      );
    } catch (e) {
      await api.sendMessage(
        `❌ Kick ব্যর্থ (বট অ্যাডমিন কি?): Reason=${hitList.join(" + ")} | Time(BD)=${timeStr}`,
        threadID
      );
    }
    return;
  }

  // WARN মোড
  const count = (cfg.strikes[senderID] || 0) + 1;
  cfg.strikes[senderID] = count;

  await api.sendMessage(
    `🚫 𝙁𝙡𝙖𝙜𝙜𝙚𝙙 𝙈𝙚𝙙𝙞𝙖: ${hitList.join(" + ")}
⚠️ ${count}/${cfg.strikesLimit} strike
🕒 BD Time: ${timeStr}
(আর একবার হলে কিক করা হবে)`,
    threadID
  );

  if (count >= cfg.strikesLimit) {
    try {
      await api.removeUserFromGroup(senderID, threadID);
      await api.sendMessage(
        `⛔ Strike limit reached — user KICKED. (BD: ${timeStr})`,
        threadID
      );
      delete cfg.strikes[senderID];
    } catch {
      await api.sendMessage(`❌ Kick ব্যর্থ (বট অ্যাডমিন কি?)`, threadID);
    }
  }
}

module.exports = {
  config: {
    name: "automod",
    version: "1.0.0",
    author: "Rahad",
    role: 1, // admin-level command (change if needed)
    shortDescription: "Auto-kick NSFW/Violence/Horror media",
    longDescription:
      "গ্রুপে 18+/হিংস্র/হরর ছবি/ভিডিও ধরা পরলে অটো-কিক/ওয়ার্ন, থ্রেডভিত্তিক সেটিংসসহ।",
    category: "moderation",
  },

  // Goat Bot V2 এ onStart রাখা ভাল (loadAll বিষয়)
  onStart: async function () {
    fs.ensureDirSync(DB_DIR);
    if (!fs.existsSync(DB_PATH)) saveDB({});
  },

  // কমান্ড কনফিগারেশন
  onCommand: async function ({ args, event, api }) {
    const db = loadDB();
    const cfg = getThread(db, event.threadID);

    const sub = (args[0] || "").toLowerCase();

    if (sub === "on") {
      cfg.enabled = true;
      saveDB(db);
      return api.sendMessage("✅ AutoMod ON করা হয়েছে।", event.threadID);
    }
    if (sub === "off") {
      cfg.enabled = false;
      saveDB(db);
      return api.sendMessage("⏸️ AutoMod OFF করা হয়েছে।", event.threadID);
    }
    if (sub === "action" && args[1]) {
      const v = args[1].toLowerCase();
      if (!["kick","warn"].includes(v)) {
        return api.sendMessage("Usage: automod action kick|warn", event.threadID);
      }
      cfg.action = v;
      saveDB(db);
      return api.sendMessage(`⚙️ Action set: ${v.toUpperCase()}`, event.threadID);
    }
    if (sub === "strikes" && args[1] && !isNaN(args[1])) {
      cfg.strikesLimit = Math.max(1, parseInt(args[1]));
      saveDB(db);
      return api.sendMessage(`⚙️ Strikes limit set: ${cfg.strikesLimit}`, event.threadID);
    }
    if (sub === "categories") {
      // ex: automod categories nsfw,on | violence,off | horror,on
      const rest = args.slice(1).join(" ");
      if (!rest) {
        return api.sendMessage(
          "Usage: automod categories nsfw,on | violence,off | horror,on",
          event.threadID
        );
      }
      const parts = rest.split("|").map(s => s.trim()).filter(Boolean);
      for (const p of parts) {
        const [cat, val] = p.split(",").map(x => x.trim().toLowerCase());
        if (["nsfw","violence","horror"].includes(cat) && ["on","off"].includes(val)) {
          cfg.categories[cat] = (val === "on");
        }
      }
      saveDB(db);
      return api.sendMessage(
        `⚙️ Categories → NSFW:${cfg.categories.nsfw?"ON":"OFF"} | VIOLENCE:${cfg.categories.violence?"ON":"OFF"} | HORROR:${cfg.categories.horror?"ON":"OFF"}`,
        event.threadID
      );
    }
    if (sub === "status") {
      return api.sendMessage(
        `🛡️ AutoMod Status
• Enabled: ${cfg.enabled ? "ON" : "OFF"}
• Action: ${cfg.action.toUpperCase()}
• Strikes(limit): ${cfg.strikesLimit}
• Categories: NSFW=${cfg.categories.nsfw?"ON":"OFF"}, VIOLENCE=${cfg.categories.violence?"ON":"OFF"}, HORROR=${cfg.categories.horror?"ON":"OFF"}
• BD Time Now: ${nowBD()}`,
        event.threadID
      );
    }

    return api.sendMessage(
      "Usage:\n- automod on/off\n- automod action kick|warn\n- automod strikes <number>\n- automod categories nsfw,on | violence,on | horror,on\n- automod status",
      event.threadID
    );
  },

  // ইনকামিং মেসেজ হ্যান্ডলার
  onMessage: async function ({ event, api }) {
    try {
      const { threadID, body = "", messageReply, attachments = [] } = event;
      const db = loadDB();
      const cfg = getThread(db, threadID);
      if (!cfg.enabled) return;

      // শুধুই মিডিয়া আছে? না থাকলেও টেক্সটে কীওয়ার্ড?
      let triggered = { nsfw: false, violence: false, horror: false };

      // টেক্সট কীওয়ার্ড
      const textHit = basicMatch(body);
      triggered.nsfw = triggered.nsfw || textHit.nsfw;
      triggered.violence = triggered.violence || textHit.violence;
      triggered.horror = triggered.horror || textHit.horror;

      // রেপ্লাই করা মেসেজের অ্যাটাচমেন্টও ধরা
      let allAttachments = [...attachments];
      if (messageReply && Array.isArray(messageReply.attachments))
        allAttachments = allAttachments.concat(messageReply.attachments);

      // প্রতিটা মিডিয়া স্ক্যান
      for (const att of allAttachments) {
        const type = (att.type || "").toLowerCase();
        const url = att.url || att.previewUrl || "";
        const filename = att.filename || "";

        // বেসিক কীওয়ার্ড ম্যাচ
        const b = basicMatch("", url, filename);
        triggered.nsfw = triggered.nsfw || b.nsfw;
        triggered.violence = triggered.violence || b.violence;
        triggered.horror = triggered.horror || b.horror;

        // শুধুমাত্র ইমেজে advanced nsfw (থাকলে)
        if (nsfwLib && tf && (type.includes("photo") || type === "image")) {
          try {
            const buf = await downloadToBuffer(url);
            const preds = await nsfwClassifyImage(buf);
            const adv = decideByPredictions(preds);
            triggered.nsfw = triggered.nsfw || adv.nsfw;
          } catch (_) {}
        }
      }

      // যদি কোনো enabled ক্যাটাগরি ধরা পড়ে → action
      const anyEnabledHit =
        (cfg.categories.nsfw && triggered.nsfw) ||
        (cfg.categories.violence && triggered.violence) ||
        (cfg.categories.horror && triggered.horror);

      if (anyEnabledHit) {
        await handleAction({ api, event, cfg, hitCategories: triggered });
        saveDB(db);
      }
    } catch (e) {
      // নীরবে ফেল-সেফ
    }
  }
};
