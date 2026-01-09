
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { translations, Language } from '../translations.ts';

interface Props {
  onBack: () => void;
  language: Language;
}

const PostPage: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language];
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [isBeautifying, setIsBeautifying] = useState<number | null>(null);
  const [petInfo, setPetInfo] = useState({
    name: '',
    type: 'Dog',
    age: '',
    breed: '',
    description: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file: File) => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const beautifyImage = async (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl || isBeautifying !== null) return;
    
    setIsBeautifying(index);
    if ('vibrate' in navigator) navigator.vibrate(20);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      const ai = new GoogleGenAI({ apiKey: process?.env?.API_KEY || "" });
      const genResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: language === 'en' 
                ? "Enhance this pet photo to make it look more adoptable. Improve lighting, clarity, and add a soft, warm, blurred domestic background. Return the edited image."
                : "优化这张宠物照片，让它看起来更适合领养。提高光照、清晰度，并添加一个柔和、温馨且模糊的家庭背景。请返回编辑后的图片。" }
          ]
        }
      });

      for (const part of genResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          const newUrl = `data:image/png;base64,${part.inlineData.data}`;
          setImages(prev => {
            const next = [...prev];
            next[index] = newUrl;
            return next;
          });
          break;
        }
      }
    } catch (error) {
      console.error("Beautify error:", error);
    } finally {
      setIsBeautifying(null);
    }
  };

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg transition-colors pt-16 flex flex-col overflow-hidden">
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 apple-blur sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-ios-accent font-medium">
          {t.cancel}
        </button>
        <h1 className="text-lg font-extrabold dark:text-white">{t.postAdoption}</h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center gap-2 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-ios-accent shadow-[0_0_8px_rgba(242,13,89,0.3)]' : 'bg-gray-200 dark:bg-gray-800'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold dark:text-white tracking-tight">{t.petPhotos}</h2>
                <p className="text-ios-secondary font-medium">Add photos and use AI to make them perfect.</p>
              </div>

              <input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={handleImageUpload} />

              {images.length === 0 ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] bg-white dark:bg-dark-card rounded-ios-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-4 group"
                >
                  <div className="w-20 h-20 rounded-full bg-ios-bg dark:bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl text-ios-secondary">add_a_photo</span>
                  </div>
                  <span className="text-lg font-bold dark:text-white">Upload Photos</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-4 -mx-2 px-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative flex-shrink-0 w-[80%] aspect-[3/4] rounded-ios overflow-hidden shadow-2xl snap-center animate-slide-up">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button onClick={() => removeImage(idx)} className="bg-black/40 backdrop-blur-md w-10 h-10 rounded-full text-white flex items-center justify-center active:scale-90 transition-all">
                            <span className="material-symbols-outlined text-xl">close</span>
                          </button>
                          <button 
                            onClick={() => beautifyImage(idx)} 
                            disabled={isBeautifying !== null}
                            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all ${isBeautifying === idx ? 'bg-ios-accent text-white animate-spin' : 'bg-white/90 text-ios-accent shadow-lg'}`}
                          >
                            <span className="material-symbols-outlined text-xl">{isBeautifying === idx ? 'sync' : 'magic_button'}</span>
                          </button>
                        </div>
                        {isBeautifying === idx && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <p className="text-white font-black text-xs uppercase tracking-widest animate-pulse">{t.beautifying}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-32 aspect-[3/4] bg-white dark:bg-dark-card rounded-ios border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-ios-secondary">add</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold dark:text-white tracking-tight">{t.basicInfo}</h2>
              </div>
              <div className="space-y-4">
                <input placeholder="Name" value={petInfo.name} onChange={(e) => setPetInfo({...petInfo, name: e.target.value})} className="w-full h-16 bg-white dark:bg-dark-card rounded-ios px-6 font-bold shadow-sm outline-none dark:text-white" />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Age" value={petInfo.age} onChange={(e) => setPetInfo({...petInfo, age: e.target.value})} className="w-full h-16 bg-white dark:bg-dark-card rounded-ios px-6 font-bold shadow-sm outline-none dark:text-white" />
                  <input placeholder="Breed" value={petInfo.breed} onChange={(e) => setPetInfo({...petInfo, breed: e.target.value})} className="w-full h-16 bg-white dark:bg-dark-card rounded-ios px-6 font-bold shadow-sm outline-none dark:text-white" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2"><h2 className="text-3xl font-extrabold dark:text-white tracking-tight">{t.petStory}</h2></div>
              <textarea placeholder="Tell us more..." value={petInfo.description} onChange={(e) => setPetInfo({...petInfo, description: e.target.value})} className="w-full h-64 bg-white dark:bg-dark-card rounded-ios p-6 font-medium shadow-sm outline-none dark:text-white resize-none" />
            </div>
          )}
        </div>
      </div>

      <div className="p-8 pb-10 apple-blur bg-ios-blur/80 dark:bg-dark-blur/80 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-4">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="w-20 h-16 bg-white dark:bg-dark-card rounded-ios flex items-center justify-center text-ios-secondary shadow-sm active:scale-95 transition-all">
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
          )}
          <button 
            disabled={step === 1 && images.length === 0}
            onClick={() => { if (step < 3) setStep(s => s + 1); else onBack(); }}
            className={`flex-1 h-16 rounded-ios font-bold text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${(step === 1 && images.length === 0) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-ios-accent text-white'}`}
          >
            {step === 3 ? t.publish : t.continue}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
