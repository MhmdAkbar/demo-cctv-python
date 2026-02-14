import cv2
import requests
import base64
import time
import threading
from ultralytics import YOLO
from flask import Flask, Response

# Setup server Flask
app = Flask(__name__)

# Load model YOLOv8
print("Memuat model YOLOv8...")
model = YOLO('yolov8n.pt') 
API_URL = "http://localhost:3000/api/alert"
cap = cv2.VideoCapture(0)

# Variabel global untuk frame terbaru
latest_frame = None 
lock = threading.Lock() # Mencegah race condition antar thread

# Thread 1: Proses deteksi objek berjalan di background
def detection_loop():
    global latest_frame
    is_cooldown = False
    last_alert_time = 0
    print("Kamera aktif. Memulai deteksi objek...")

    while True:
        ret, frame = cap.read()
        if not ret: continue

        # Reset cooldown setelah 10 detik
        if is_cooldown and (time.time() - last_alert_time) > 10:
            is_cooldown = False

        # Proses deteksi menggunakan YOLO
        results = model(frame, stream=True, conf=0.6, verbose=False)
        ada_orang = False
        barang = []

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                name = model.names[cls_id]
                
                # Filter objek yang terdeteksi
                if name == "person": ada_orang = True
                elif name in ["backpack", "cell phone", "laptop", "handbag", "cup", "bottle", "knife"]:
                    barang.append(name)
                
                # Gambar bounding box dan label pada frame
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        # Kirim alert jika terdeteksi orang dan tidak dalam masa cooldown
        if ada_orang and not is_cooldown:
            print(f"Alert: Terdeteksi orang membawa {barang}")
            _, buffer = cv2.imencode('.jpg', frame)
            foto_b64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
            
            try:
                requests.post(API_URL, json={
                    "tipe": "ORANG MENCURIGAKAN",
                    "info": barang if barang else ["Tangan Kosong"],
                    "image": foto_b64
                })
                print("Data terkirim ke server Node.js.")
                is_cooldown = True
                last_alert_time = time.time()
            except Exception as e:
                print(f"Gagal mengirim data: Server Node.js mungkin offline.")

        # Update frame global secara aman
        with lock:
            ret, buffer = cv2.imencode('.jpg', frame)
            latest_frame = buffer.tobytes()

# Thread 2: Generator MJPEG stream untuk frontend
def generate_stream():
    global latest_frame
    while True:
        with lock:
            if latest_frame is None:
                continue
            frame_bytes = latest_frame
        
        # Kirim frame dalam format multipart
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.05) # Batasi frame rate (~20 FPS)

@app.route('/video_feed')
def video_feed():
    # Endpoint untuk video streaming
    return Response(generate_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # Jalankan thread deteksi
    t = threading.Thread(target=detection_loop)
    t.daemon = True
    t.start()
    
    # Jalankan server Flask
    print("Server streaming berjalan di port 5000.")
    app.run(host='0.0.0.0', port=5000, threaded=True, use_reloader=False)