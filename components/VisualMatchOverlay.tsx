
import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { translations, Language } from '../translations';

interface Props {
  onClose: () => void;
  language: Language;
}

const VisualMatchOverlay: React.FC<Props> = ({ onClose, language }) => {
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;
    
    setIsScanning(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          },
          {
            text: language === 'en' 
              ? "Analyze this living space. Is it suitable for a dog or a cat? What specific breed traits would fit here? Reply in 50 words with a warm tone." 
              : "分析这张居住环境照片。这里适合养狗还是养猫？什么样的品种特质最契合这个空间？请用温馨的语气在100字内回复。"
          }
        ]
      });
      setResult(response.text || "AI Analysis Failed");
    } catch (error) {
      console.error("Analysis Error:", error);
      setResult(language === 'en' ? "Failed to analyze space." : "分析失败。");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-fade-in">
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      
      <header className="relative p-8 flex justify-between items-center z-10">
        <button onClick={onClose} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full text-white flex items-center justify-center">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="px-4 py-1.5 bg-ios-accent/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest">
          AI Vision
        </div>
      </header>

      <div className="relative flex-1 flex flex-col items-center justify-center z-10">
        {!result && (
          <div className="w-64 h-64 border-2 border-white/40 rounded-[40px] relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-ios-accent/60 shadow-[0_0_15px_rgba(242,13,89,1)] ${isScanning ? 'animate-bounce' : 'animate-pulse'}`} style={{ top: isScanning ? '50%' : '10%' }} />
          </div>
        )}
        
        {result && (
          <div className="mx-6 p-6 apple-blur bg-white/90 dark:bg-black/80 rounded-ios-lg shadow-2xl animate-pop text-center space-y-4">
            <div className="w-12 h-12 bg-ios-accent rounded-full mx-auto flex items-center justify-center text-white">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <p className="text-ios-text dark:text-white font-bold leading-relaxed">{result}</p>
            <button onClick={() => setResult(null)} className="text-ios-accent font-black text-xs uppercase tracking-widest pt-2 block mx-auto">Scan Again</button>
          </div>
        )}
      </div>

      <footer className="relative p-12 flex flex-col items-center gap-4 z-10">
        {!result && (
          <>
            <button 
              onClick={captureAndAnalyze}
              disabled={isScanning}
              className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-90 ${isScanning ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                 {isScanning ? <div className="w-6 h-6 border-4 border-ios-accent border-t-transparent rounded-full animate-spin" /> : null}
              </div>
            </button>
            <p className="text-white/80 text-sm font-bold">{isScanning ? t.scanning : t.visualMatchDesc}</p>
          </>
        )}
      </footer>
    </div>
  );
};

export default VisualMatchOverlay;
