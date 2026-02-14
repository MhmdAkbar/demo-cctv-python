import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import cors from 'cors';

// Load variabel environment
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Izinkan akses lintas domain (CORS) untuk React
app.use(cors()); 
// Tingkatkan limit payload untuk menerima foto Base64
app.use(express.json({ limit: '10mb' })); 

// Validasi environment variables Telegram
if (!process.env.TELEGRAM_TOKEN || !process.env.CHAT_ID) {
    console.error('❌ ERROR: TELEGRAM_TOKEN atau CHAT_ID belum di-set di file .env');
    process.exit(1);
}

// Inisialisasi bot Telegram
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN.trim(), { polling: false });

// In-memory state untuk menyimpan status CCTV terbaru
let statusCCTV = {
    kondisi: "Aman",
    waktuTerakhir: "-",
    barangBawaan: [],
    fotoBase64: null
};

// Endpoint POST: Menerima data alert dari AI Python
app.post('/api/alert', async (req, res) => {
    const { tipe, info, image } = req.body;
    
    // Update state global
    statusCCTV = {
        kondisi: tipe,
        waktuTerakhir: new Date().toLocaleString('id-ID'),
        barangBawaan: info,
        fotoBase64: image
    };

    const detail = info.join(', ');
    const pesan = `⚠️ **CCTV ALERT:** Terdeteksi membawa: *${detail}*`;

    try {
        if (image) {
            // Konversi Base64 ke Buffer untuk dikirim via Telegram
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
            // Kirim notifikasi foto ke Telegram
            await bot.sendPhoto(process.env.CHAT_ID.trim(), imageBuffer, { caption: pesan, parse_mode: 'Markdown' });
            console.log(`📸 Peringatan dikirim ke Telegram: ${detail}`);
        } else {
            // Kirim notifikasi teks jika tidak ada gambar
            await bot.sendMessage(process.env.CHAT_ID.trim(), pesan, { parse_mode: 'Markdown' });
        }
        
        res.status(200).json({ success: true, message: 'Alert diproses' });
    } catch (error) {
        console.error('❌ Gagal kirim Telegram:', error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Endpoint GET: Menyediakan status terbaru untuk React UI
app.get('/api/status', (req, res) => {
    res.status(200).json(statusCCTV);
});

// Start server Express
app.listen(port, () => {
    console.log(` API Gateway berjalan di http://localhost:${port}`);
});