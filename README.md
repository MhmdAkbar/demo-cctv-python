# Demo CCTV Python

## Deskripsi

Demo CCTV Python adalah sebuah proyek *proof-of-concept* (PoC) Smart CCTV yang terdiri dari tiga bagian utama:

* **AI**: Deteksi objek secara *real-time* menggunakan YOLOv8 (Python)
* **Backend**: Server API dan Gateway Notifikasi Telegram (Node.js/Express)
* **Frontend**: Antarmuka pengguna *dashboard* keamanan berbasis web (React + Vite + Tailwind CSS)

---

## Teknologi yang Digunakan

### AI

* Python 3.x
* [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
* OpenCV
* PyTorch
* Flask (Untuk MJPEG Video Streaming)

### Backend

* Node.js
* Express.js
* dotenv
* node-telegram-bot-api

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript (ES6+)

---

## Struktur Direktori

```text
ai/
  detection.py
  yolov8n.pt
backend/
  server.js
  package.json
  .env
frontend/
  src/
  public/
  package.json
  vite.config.js
  ...

```

---

## Konfigurasi Environment (`.env`)

Sebelum menjalankan layanan *backend*, Anda **wajib** membuat file konfigurasi bernama `.env` di dalam folder `backend/`. File ini berfungsi untuk mengatur port API Gateway dan kredensial bot Telegram untuk pengiriman notifikasi/alert.

Buat file backend/.env dan isi dengan baris berikut:

```Cuplikan kode
PORT=3000
TELEGRAM_TOKEN=isi_dengan_token_bot_anda
CHAT_ID=isi_dengan_id_telegram_anda
```
### Penjelasan Variabel & Cara Mendapatkannya:
1. PORT: Port lokal tempat server Express.js berjalan (digunakan oleh React untuk fetching data status). Biarkan di angka 3000.

2. TELEGRAM_TOKEN: Token akses rahasia untuk mengontrol bot Telegram pengirim notifikasi.
Cara mendapatkan Token:

- Buka aplikasi Telegram dan cari @BotFather di kolom pencarian.

- Ketik atau klik /start, lalu ketik /newbot untuk membuat bot baru.

- Masukkan Nama Bot (misalnya: Keamanan CCTV).

- Masukkan Username Bot yang unik dan harus diakhiri dengan kata "bot" (misalnya: demo_cctv_bot).

- BotFather akan memberikan pesan berisi HTTP API Token (deretan angka dan huruf yang panjang). Salin token tersebut secara utuh dan tempelkan ke variabel TELEGRAM_TOKEN.

3. CHAT_ID: ID unik pengguna (Anda) atau grup Telegram yang akan menerima pesan peringatan dan foto tangkapan CCTV.
Cara mendapatkan Chat ID Pribadi:

- Di pencarian Telegram, cari bot bernama @userinfobot atau @getmyid_bot.

- Klik /start.

- Bot akan langsung membalas dengan detail akun Anda. Cari baris bertuliskan ID yang berisi deretan angka (contoh: 6547626192).

- Salin angka tersebut dan tempelkan ke variabel CHAT_ID.

- ⚠️ Langkah Wajib: Buka kembali kolom pencarian, cari username bot CCTV yang Anda buat di BotFather sebelumnya, buka chat-nya, dan klik /start. Jika ini dilewatkan, bot tidak akan memiliki izin untuk mengirim pesan ke Anda, dan server Node.js akan mengalami error.
## Requirement & Dependency

### AI

* Python 3.x
* Install dependencies:
```bash
pip install ultralytics opencv-python torch requests flask

```


* File model YOLO: Pastikan `yolov8n.pt` berada di direktori yang sama dengan *script* Python.

### Backend

* Node.js (v16+ disarankan)
* Install dependencies:
```bash
cd backend
npm install express cors dotenv node-telegram-bot-api

```



### Frontend

* Node.js (v16+ disarankan)
* Install dependencies:
```bash
cd frontend
npm install

```



---

## Cara Menjalankan

Untuk menjalankan arsitektur proyek ini secara utuh, Anda perlu membuka **tiga terminal terpisah**.

### 1. Jalankan AI Worker & Streaming (Terminal 1)

Masuk ke folder AI dan jalankan *script* Python. Ini akan menyalakan kamera, memulai deteksi AI di *background*, dan membuka *port streaming* di `5000`.

```bash
cd ai
python detection.py

```

### 2. Jalankan Backend API Gateway (Terminal 2)

Masuk ke folder Backend. Server ini bertugas menerima *alert* dari Python (Port `3000`) dan meneruskannya ke Telegram.

```bash
cd backend
node server.js

```

### 3. Jalankan Frontend Dashboard (Terminal 3)

Masuk ke folder Frontend untuk menjalankan UI React.

```bash
cd frontend
npm run dev

```

Buka browser dan akses [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173) (atau sesuai *output* yang tertera di terminal Vite) untuk memantau CCTV secara *live*.

---

## Catatan Penting

* Pastikan semua *dependency* sudah terinstall di setiap bagian (AI, backend, frontend).
* Jika *live streaming* tidak muncul di *browser*, pastikan *script* Python berjalan dengan benar dan kamera tidak sedang dipakai oleh aplikasi lain (seperti Zoom/Meet).
* Pastikan koneksi internet stabil agar bot Node.js dapat mengirim gambar ke server Telegram dengan lancar.

---

## Lisensi

Proyek ini dibuat untuk keperluan demo dan *proof-of-concept*.

---