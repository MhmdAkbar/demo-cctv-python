import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Sangat penting agar React nanti bisa narik data ke sini
app.use(express.json({ limit: "10mb" })); // Agar bisa nerima file foto Base64 ukuran besar

// Validasi Token
if (!process.env.TELEGRAM_TOKEN || !process.env.CHAT_ID) {
  console.error(
    "❌ ERROR: TELEGRAM_TOKEN atau CHAT_ID belum di-set di file .env",
  );
  process.exit(1);
}

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN.trim(), {
  polling: false,
});

// 🌟 "DATABASE" SEMENTARA (In-Memory)
// Karena ini demo, kita simpan status terakhir di dalam RAM (variabel).
// Nanti React akan mengambil data dari variabel ini.
let statusCCTV = {
  kondisi: "Aman",
  waktuTerakhir: "-",
  barangBawaan: [],
  fotoBase64: null,
};

// =================================================================
// [1] ENDPOINT UNTUK PYTHON: Menerima hasil deteksi (POST)
// =================================================================
app.post("/api/alert", async (req, res) => {
  const { tipe, info, image } = req.body;

  // 1. Update status di database sementara kita
  statusCCTV = {
    kondisi: tipe,
    waktuTerakhir: new Date().toLocaleString("id-ID"),
    barangBawaan: info,
    fotoBase64: image,
  };

  const detail = info.join(", ");
  const pesan = `⚠️ **CCTV ALERT:** Terdeteksi orang membawa: *${detail}*`;

  // 2. Teruskan notifikasi ke Telegram
  try {
    if (image) {
      // Bersihkan header base64 sebelum diubah jadi file binary/buffer
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      await bot.sendPhoto(process.env.CHAT_ID.trim(), imageBuffer, {
        caption: pesan,
        parse_mode: "Markdown",
      });
      console.log(`📸 Peringatan dikirim ke Telegram: ${detail}`);
    } else {
      await bot.sendMessage(process.env.CHAT_ID.trim(), pesan, {
        parse_mode: "Markdown",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Alert diterima dan diproses" });
  } catch (error) {
    console.error("❌ Gagal kirim Telegram:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// =================================================================
// [2] ENDPOINT UNTUK REACT: Mengambil status terbaru (GET)
// =================================================================
app.get("/api/status", (req, res) => {
  // React akan melakukan 'fetch' ke sini untuk update UI Dashboard
  res.status(200).json(statusCCTV);
});

// Jalankan Server
app.listen(port, () => {
  console.log(`🚀 API Gateway (Express) berjalan di http://localhost:${port}`);
  console.log(`📡 Menunggu koneksi dari AI Python...`);
});
