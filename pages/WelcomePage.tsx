
import React from 'react';
import { translations, Language } from '../translations';

interface Props {
  onStart: () => void;
  language: Language;
}

const WelcomePage: React.FC<Props> = ({ onStart, language }) => {
  const t = translations[language];
  
  return (
    <div className="relative h-full w-full bg-black flex flex-col justify-end overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-110"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1000')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative p-8 pb-16 flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="bg-ios-accent p-2 rounded-2xl shadow-xl animate-float">
            <span className="material-symbols-outlined text-white text-3xl">pets</span>
          </div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight">PawPal</h1>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-white text-4xl font-extrabold leading-tight whitespace-pre-line">
            {t.findFriend}
          </h2>
          <p className="text-gray-300 text-lg">
            {t.adoptDontShop}
          </p>
        </div>

        <button 
          onClick={onStart}
          className="bg-ios-accent text-white h-16 rounded-ios text-xl font-bold transition-all active:scale-95 shadow-2xl hover:brightness-110 flex items-center justify-center gap-2 mt-4"
        >
          {t.letsExplore}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
