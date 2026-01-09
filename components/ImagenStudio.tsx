
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { translations, Language } from '../translations.ts';

interface Props {
  onClose: () => void;
  language: Language;
}

const ImagenStudio: React.FC<Props> = ({ onClose, language }) => {
  const t = translations[language];
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const stylePrompts: Record<string, string> = {
    cinematic: "cinematic style, dramatic lighting, high detail, 8k resolution, photorealistic",
    pixar: "3D animation style, Pixar inspired, cute characters, vibrant colors, soft lighting, wide eyes",
    watercolor: "watercolor painting style, soft edges, artistic, pastel colors, textured paper",
    studio: "professional studio portrait, clean solid background, sharp focus, high-end commercial photography",
    cyberpunk: "cyberpunk aesthetic, neon holographic lights, futuristic tech accessories, high contrast"
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Requirement: Check for API Key selection before call
    const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio?.openSelectKey();
    }
    
    setIsGenerating(true);
    setGeneratedImage(null);
    if ('vibrate' in navigator) navigator.vibrate(20);

    try {
      // Requirement: Fresh instance right before call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const fullPrompt = `A cute and high-detail portrait of a pet, ${prompt}, ${stylePrompts[selectedStyle]}`;
      
      try {
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: fullPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
          },
        });

        if (response.generatedImages?.[0]?.image?.imageBytes) {
          const base64Data = response.generatedImages[0].image.imageBytes;
          setGeneratedImage(`data:image/jpeg;base64,${base64Data}`);
          if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
        }
      } catch (e: any) {
        // Robust Error Handling for 500 / RPC / XHR failures
        const errorMsg = e.message || "";
        console.error("Imagen API internal error:", e);
        
        if (
          errorMsg.includes("Requested entity was not found") || 
          errorMsg.includes("Rpc failed") || 
          errorMsg.includes("500") ||
          errorMsg.includes("xhr error")
        ) {
          console.warn("Project restriction detected. Prompting for key selection...");
          await (window as any).aistudio?.openSelectKey();
          throw new Error(language === 'en' 
            ? "Your API key project might not support Imagen 4.0. Please select a valid paid project key."
            : "您的 API 密钥项目可能不支持 Imagen 4.0。请选择一个有效的已付费项目密钥。");
        }
        throw e;
      }
    } catch (error: any) {
      console.error("Imagen Generation Error:", error);
      alert(error.message || "Failed to generate image. Please try again with a valid project key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-ios-bg dark:bg-dark-bg flex flex-col animate-fade-in overflow-hidden">
      <header className="pt-16 pb-4 px-6 apple-blur bg-ios-blur dark:bg-dark-blur/80 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
        <button onClick={onClose} className="text-ios-accent font-bold">{t.cancel}</button>
        <h2 className="text-lg font-extrabold dark:text-white">{t.aiStudio}</h2>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Preview Section */}
        <section className="space-y-4">
          <div className="aspect-square w-full bg-white dark:bg-dark-card rounded-ios-lg shadow-inner overflow-hidden flex items-center justify-center relative border border-gray-100 dark:border-gray-800">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-6 animate-pulse">
                <div className="relative">
                   <div className="w-20 h-20 border-[6px] border-ios-accent/20 border-t-ios-accent rounded-full animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="material-symbols-outlined text-ios-accent animate-bounce">auto_awesome</span>
                   </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-ios-accent font-black text-xs uppercase tracking-widest">{t.generatingArt}</p>
                  <p className="text-[10px] text-ios-secondary font-medium">Mixing the colors...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <img src={generatedImage} alt="Generated Art" className="w-full h-full object-cover animate-pop" />
            ) : (
              <div className="text-center p-8 space-y-4 opacity-40">
                <div className="w-20 h-20 bg-ios-bg dark:bg-black rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-4xl">palette</span>
                </div>
                <p className="font-bold text-sm max-w-[200px] mx-auto">
                  {language === 'en' ? 'Describe your pet to start creating' : '描述您的宠物以开始创作'}
                </p>
              </div>
            )}
            
            {generatedImage && !isGenerating && (
               <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl text-ios-accent active:scale-90 transition-all">
                 <span className="material-symbols-outlined">download</span>
               </button>
            )}
          </div>
        </section>

        {/* Input Section */}
        <section className="space-y-4 animate-slide-up">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ios-secondary ml-4">{language === 'en' ? 'Describe Prompt' : '描述词'}</h3>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.imaginePrompt}
              className="w-full h-32 bg-white dark:bg-dark-card rounded-ios p-5 font-medium shadow-sm outline-none dark:text-white resize-none border border-transparent focus:border-ios-accent/30 transition-all"
            />
          </div>
        </section>

        {/* Style Selection */}
        <section className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ios-secondary ml-4">{language === 'en' ? 'Select Style' : '选择风格'}</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
            {Object.keys(stylePrompts).map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-5 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedStyle === style 
                    ? 'bg-ios-accent text-white border-ios-accent shadow-lg shadow-ios-accent/30 scale-105' 
                    : 'bg-white dark:bg-dark-card text-ios-secondary border-gray-100 dark:border-gray-800'
                }`}
              >
                {t.styles[style as keyof typeof t.styles]}
              </button>
            ))}
          </div>
        </section>
        
        {/* Billing Info Footer */}
        <div className="text-center pt-4">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-ios-secondary font-bold uppercase tracking-widest underline decoration-ios-accent/30 hover:text-ios-accent transition-colors"
          >
            Billing information for Imagen 4.0
          </a>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-8 pb-10 apple-blur bg-ios-blur/90 dark:bg-dark-blur/90 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`w-full h-16 rounded-ios font-bold text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
            !prompt.trim() || isGenerating ? 'bg-gray-200 text-gray-400' : 'bg-ios-accent text-white shadow-ios-accent/30'
          }`}
        >
          <span className="material-symbols-outlined">auto_fix_high</span>
          {isGenerating ? (language === 'en' ? 'Generating...' : '正在生成...') : t.generateArt}
        </button>
      </div>
    </div>
  );
};

export default ImagenStudio;
