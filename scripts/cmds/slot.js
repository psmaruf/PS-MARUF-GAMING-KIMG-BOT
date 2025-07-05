module.exports = {
  config: {
    name: "slot",
    version: "1.4",
    author: "BaYjid",
    shortDescription: {
      en: "🎰 Slot with limit & style",
    },
    longDescription: {
      en: "Try your luck with 20 spins every 24 hours. Big flex if you jackpot 💎",
    },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "❌ Type a real number, genius.",
      spin_message: "🎲 Pulling the lever... let's roll!",
      win_message: "🤑 You just earned $%1!",
      lose_message: "💀 You lost $%1. Ouch.",
      jackpot_message: "💎💥 JACKPOT!!! You won $%1 with three %2s!",
      balance_message: "💰 Balance: $%1",
      spin_limit_reached: "⛔ Max 20 spins used. Try again in %1h %2m %3s.",
      spins_left: "🎮 Spins left: %1/20",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const bet = parseInt(args[0]);
    const now = Date.now();

    if (isNaN(bet) || bet <= 0) return message.reply(getLang("invalid_amount"));
    if (bet > userData.money) return; // 😶 No msg if broke

    const spinData = userData.data?.slotSpin || { count: 0, resetTime: now };

    // Reset if 24h passed
    if (now - spinData.resetTime >= 86400000) {
      spinData.count = 0;
      spinData.resetTime = now;
    }

    // Spin limit check
    if (spinData.count >= 20) {
      const wait = 86400000 - (now - spinData.resetTime);
      const h = Math.floor(wait / 3600000);
      const m = Math.floor((wait % 3600000) / 60000);
      const s = Math.floor((wait % 60000) / 1000);
      return message.reply(getLang("spin_limit_reached").replace("%1", h).replace("%2", m).replace("%3", s));
    }

    await message.reply(getLang("spin_message"));

    const slots = ["🍒", "🍋", "💎", "💚", "⭐", "💛", "💙"];
    const [a, b, c] = Array(3).fill().map(() => slots[Math.floor(Math.random() * slots.length)]);

    const winnings = calculateWinnings(a, b, c, bet);
    const updatedBalance = userData.money + winnings;

    spinData.count++;

    await usersData.set(senderID, {
      money: updatedBalance,
      data: {
        ...userData.data,
        slotSpin: spinData,
      },
    });

    const visuals = `🎰 [ ${a} | ${b} | ${c} ]`;
    const resultMsg = getSpinResultMessage(a, b, c, winnings, getLang);
    const balanceMsg = getLang("balance_message").replace("%1", updatedBalance);
    const spinsLeft = getLang("spins_left").replace("%1", 20 - spinData.count);

    setTimeout(() => {
      message.reply(`${visuals}\n${resultMsg}\n${balanceMsg} | ${spinsLeft}`);
    }, 1000);
  },
};

function calculateWinnings(a, b, c, bet) {
  if (a === "💎" && b === "💎" && c === "💎") return bet * 10;
  if (a === b && b === c) return bet * 5;
  if (a === b || a === c || b === c) return bet * 2;
  return -bet;
}

function getSpinResultMessage(a, b, c, win, getLang) {
  if (win > 0) {
    if (a === "💎" && b === "💎" && c === "💎") {
      return getLang("jackpot_message")
        .replace("%1", win)
        .replace("%2", "💎");
    }
    return getLang("win_message").replace("%1", win);
  } else {
    return getLang("lose_message").replace("%1", -win);
  }
}