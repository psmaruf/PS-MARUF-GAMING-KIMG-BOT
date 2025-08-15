const fs = require("fs-extra");
const path = require("path");
const PDFDocument = require("pdfkit");

module.exports = {
  config: {
    name: "pdf",
    version: "1.1",
    author: "Rahad Boss",
    countDown: 5,
    role: 0,
    shortDescription: "Text to PDF (Stylish)",
    category: "tools",
    guide: "{p}pdf <your text>"
  },
  onStart: async function ({ message, args }) {
    if (!args[0]) return message.reply("📄 Please type some text to make a PDF!");

    const text = args.join(" ");
    const filePath = path.join(__dirname, "output.pdf");
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Stylish Title
    doc.fontSize(20).fillColor("#FF1493").text("💖 Bby - PDF Creator 💖", { align: "center" });
    doc.moveDown();

    // Main Text
    doc.fontSize(14).fillColor("#000000").text(text, { align: "left" });
    doc.moveDown();

    // Footer Signature
    doc.fontSize(12).fillColor("#1E90FF").text("✨ Powered By Rahad Boss ✨", { align: "center" });
    doc.end();

    stream.on("finish", () => {
      message.reply({
        body: "✅ **PDF Created Successfully!**\n━━━━━━━━━━━━━━━━\n📎 Your stylish PDF is ready!\n━━━━━━━━━━━━━━━━\n✨ Rahad Boss ✨",
        attachment: fs.createReadStream(filePath)
      });
    });
  }
};
