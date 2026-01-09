
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { translations, Language } from '../translations';

interface Props {
  onClose: () => void;
  language: Language;
}

const AIAssistant: React.FC<Props> = ({ onClose, language }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: t.aiGreeting }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Voice Mode Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const toggleVoiceMode = async () => {
    if (!isVoiceMode) {
      await startVoiceSession();
    } else {
      stopVoiceSession();
    }
    setIsVoiceMode(!isVoiceMode);
  };

  const startVoiceSession = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const inputCtx = new AudioContext({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
          });
        },
        onmessage: async (msg: LiveServerMessage) => {
          const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData && audioContextRef.current) {
            const bytes = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            
            const now = audioContextRef.current.currentTime;
            const startTime = Math.max(now, nextStartTimeRef.current);
            source.start(startTime);
            nextStartTimeRef.current = startTime + buffer.duration;
          }
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        systemInstruction: t.aiSystemInstruction
      }
    });
    sessionRef.current = sessionPromise;
  };

  const stopVoiceSession = () => {
    sessionRef.current?.then((s: any) => s.close());
    audioContextRef.current?.close();
  };

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messageToSend,
        config: { systemInstruction: t.aiSystemInstruction },
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "..." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Network error..." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative bg-white dark:bg-dark-card w-full rounded-ios-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${isVoiceMode ? 'h-[60vh]' : 'max-h-[85vh]'}`}>
        
        {/* Voice Mode UI */}
        {isVoiceMode ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 animate-fade-in">
            <div className="relative">
              <div className="w-32 h-32 bg-ios-accent/20 rounded-full animate-ping absolute inset-0" />
              <div className="w-32 h-32 bg-ios-accent rounded-full flex items-center justify-center relative shadow-2xl">
                <span className="material-symbols-outlined text-white text-5xl">mic</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black dark:text-white">{t.aiVoiceMode}</h3>
              <p className="text-ios-secondary font-bold uppercase tracking-widest text-xs animate-pulse">Listening...</p>
            </div>
            <button 
              onClick={toggleVoiceMode}
              className="px-8 py-4 bg-gray-100 dark:bg-black rounded-full text-red-500 font-bold active:scale-95 transition-all"
            >
              End Call
            </button>
          </div>
        ) : (
          <>
            <header className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-ios-accent rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                </div>
                <h2 className="font-bold dark:text-white">PawPal AI</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={toggleVoiceMode} className="p-2 text-ios-accent">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button onClick={onClose} className="p-2 text-ios-secondary">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar min-h-[300px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                    m.role === 'user' ? 'bg-ios-accent text-white rounded-tr-none' : 'bg-ios-bg dark:bg-black/40 dark:text-white rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="w-12 h-6 bg-ios-bg dark:bg-black/40 rounded-full animate-pulse" />}
            </div>

            <div className="p-6 pt-2 pb-10">
              <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={language === 'en' ? "Ask anything..." : "问问我..."}
                  className="flex-1 h-12 bg-ios-bg dark:bg-black/40 border-none rounded-full px-6 text-sm dark:text-white outline-none"
                />
                <button onClick={() => handleSend()} className="w-12 h-12 bg-ios-accent text-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
