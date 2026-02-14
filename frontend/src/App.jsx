import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState({
    kondisi: "Aman",
    waktuTerakhir: "-",
    barangBawaan: [],
    fotoBase64: null
  });

  // State untuk mengontrol Live Streaming
  const [isStreaming, setIsStreaming] = useState(false);

  // Polling data dari Express
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:3000/api/status')
        .then(res => res.json())
        .then(data => setStatus(data))
        .catch(err => console.log("Menunggu backend menyala..."));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isSafe = status.kondisi === "Aman";
  const statusColor = isSafe ? "text-emerald-400" : "text-rose-500";
  const statusBg = isSafe ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20";
  const indicatorColor = isSafe ? "bg-emerald-500" : "bg-rose-500";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-6 lg:p-8 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-800/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide text-white">SMART CCTV</h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Security Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 px-5 py-2.5 rounded-full border border-slate-800 shadow-inner">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-300">Port 3000 Linked</span>
        </div>
      </header>

      {/* Main Grid Layout (Responsive) */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
        
        {/* KIRI: Area Video / Kamera (Flex-grow agar lebih lebar) */}
        <div className="flex-1 flex flex-col gap-4">
          
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isStreaming ? "📹 Live Camera Feed" : "📸 Snapshot Terakhir"}
            </h3>
            <button 
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg active:scale-95 ${
                isStreaming 
                  ? "bg-slate-800 text-rose-400 hover:bg-slate-700 border border-slate-700" 
                  : "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-900/50"
              }`}
            >
              {isStreaming ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Hentikan Live
                </>
              ) : (
                <>▶ Putar Live Stream</>
              )}
            </button>
          </div>

          <div className="relative w-full aspect-video bg-black rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
            
            {isStreaming ? (
              <>
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="block w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  LIVE: CAM-01
                </div>
                <img 
                  src="http://localhost:5000/video_feed" 
                  alt="Live CCTV Stream" 
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                />
              </>
            ) : status.fotoBase64 ? (
              <img 
                src={status.fotoBase64} 
                alt="CCTV Snapshot" 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
              />
            ) : (
              <div className="flex flex-col items-center text-slate-500 gap-3">
                <svg className="w-16 h-16 animate-pulse opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="font-mono text-sm tracking-wide">Kamera Standby</p>
              </div>
            )}
            
            {/* Waktu Overlay pada Snapshot */}
            {!isStreaming && status.fotoBase64 && (
               <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-slate-200 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-700">
                 {status.waktuTerakhir}
               </div>
            )}
          </div>
        </div>

        {/* KANAN: Area Status & Informasi (Lebar tetap di Desktop) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          
          {/* Status Card Utama */}
          <div className={`p-6 rounded-3xl border transition-all duration-500 ${statusBg}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Status Area</h2>
              <span className="relative flex h-4 w-4">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${indicatorColor} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 ${indicatorColor}`}></span>
              </span>
            </div>
            <p className={`text-4xl font-black uppercase tracking-tight ${statusColor}`}>
              {status.kondisi}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 bg-black/20 p-3 rounded-xl">
              <span className="font-semibold text-slate-300">⏱ Update:</span>
              <span className="font-mono">{status.waktuTerakhir}</span>
            </div>
          </div>

          {/* Panel Detail Analitik */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex-1 shadow-lg">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 mb-6 uppercase border-b border-slate-800 pb-4">
              Log Deteksi Objek
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-300">Barang Terdeteksi:</span>
                
                <div className="flex flex-wrap gap-2">
                  {status.barangBawaan.length > 0 ? (
                    status.barangBawaan.map((item, index) => (
                      <span key={index} className="px-4 py-2 text-sm font-semibold capitalize bg-slate-800 text-slate-200 border border-slate-700 rounded-xl shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {item}
                      </span>
                    ))
                  ) : (
                    <div className="w-full p-4 border-2 border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-sm">
                      Mengeksplorasi area... Tidak ada anomali.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}

export default App;