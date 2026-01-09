
import React, { useState } from 'react';
import { Pet, PetType } from '../types.ts';
import { PETS } from '../constants.tsx';
import SearchOverlay from '../components/SearchOverlay.tsx';
import VisualMatchOverlay from '../components/VisualMatchOverlay.tsx';
import { translations, Language } from '../translations.ts';

interface Props {
  onSelectPet: (pet: Pet) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleLanguage: () => void;
  language: Language;
  currentLocation?: string;
}

const HomePage: React.FC<Props> = ({ onSelectPet, isDarkMode, toggleDarkMode, toggleLanguage, language, currentLocation }) => {
  const [activeCategory, setActiveCategory] = useState<PetType>('All');
  const [showSearch, setShowSearch] = useState(false);
  const [showVisualMatch, setShowVisualMatch] = useState(false);
  const categories: PetType[] = ['All', 'Dogs', 'Cats', 'Birds', 'Small'];
  
  const t = translations[language];
  const placeholderImg = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600";

  const filteredPets = PETS.filter(pet => {
    if (!pet) return false;
    if (activeCategory === 'All') return true;
    const breed = pet.breed?.toLowerCase() || '';
    if (activeCategory === 'Dogs') return breed.includes('retriever') || breed.includes('bulldog') || breed.includes('husky');
    if (activeCategory === 'Cats') return breed.includes('shorthair') || breed.includes('siamese');
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-ios-bg dark:bg-dark-bg transition-colors pt-12 relative animate-fade-in">
      {/* Header */}
      <header className="px-6 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-ios-secondary font-medium text-[10px] uppercase tracking-widest">{t.currentLocation}</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-ios-accent text-lg">location_on</span>
              <h1 className="text-ios-text dark:text-dark-text text-xl font-bold truncate max-w-[180px]">
                {currentLocation || "San Francisco, CA"}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowVisualMatch(true)}
              className="bg-white dark:bg-dark-card p-3 rounded-full shadow-sm active:scale-90 transition-all text-ios-accent"
              title={t.visualMatch}
            >
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </button>
            <button 
              onClick={toggleLanguage}
              className="bg-white dark:bg-dark-card p-3 rounded-full shadow-sm active:scale-90 transition-all flex items-center justify-center"
            >
              <span className="text-[10px] font-black dark:text-white uppercase tracking-tighter">
                {language === 'en' ? '中' : 'EN'}
              </span>
            </button>
            <button 
              onClick={toggleDarkMode}
              className="bg-white dark:bg-dark-card p-3 rounded-full shadow-sm active:scale-90 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined dark:text-white text-xl">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </div>

        {/* Search Trigger */}
        <div className="flex gap-3">
          <div 
            onClick={() => setShowSearch(true)}
            className="relative flex-1 h-14 bg-white dark:bg-dark-card rounded-ios flex items-center px-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-ios-secondary mr-3 group-hover:text-ios-accent transition-colors">search</span>
            <span className="text-ios-secondary font-medium">{t.searchPlaceholder}</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-6 h-10 rounded-full font-bold transition-all active:scale-90 flex items-center gap-2 whitespace-nowrap
                ${activeCategory === cat 
                  ? 'bg-ios-accent text-white shadow-lg shadow-ios-accent/30 animate-pop' 
                  : 'bg-white dark:bg-dark-card text-ios-secondary shadow-sm'}
              `}
            >
              <span className="text-sm">{t[cat.toLowerCase() as keyof typeof t] || cat}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Pet List */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          {filteredPets.map((pet, i) => (
            <div 
              key={pet.id} 
              onClick={() => onSelectPet(pet)}
              className="bg-white dark:bg-dark-card rounded-ios overflow-hidden shadow-sm active:scale-95 transition-all group animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                <img 
                  src={pet.image || placeholderImg} 
                  alt={pet.name || 'Pet'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md z-10 bg-ios-accent text-white">
                  {t[pet.adoptionStatus.toLowerCase() as keyof typeof t] || pet.adoptionStatus}
                </div>
              </div>
              <div className="p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-extrabold dark:text-white truncate pr-1">{pet.name || 'Unnamed'}</h3>
                </div>
                <p className="text-ios-secondary text-[11px] font-bold uppercase tracking-tighter opacity-70 truncate">
                  {pet.breed || 'Unknown Breed'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-ios-accent font-bold">
                  <span className="material-symbols-outlined text-[12px]">near_me</span>
                  {pet.distance}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSearch && (
        <SearchOverlay 
          onClose={() => setShowSearch(false)} 
          language={language}
          onSelectPet={(pet) => {
            setShowSearch(false);
            onSelectPet(pet);
          }} 
        />
      )}

      {showVisualMatch && (
        <VisualMatchOverlay 
          onClose={() => setShowVisualMatch(false)} 
          language={language} 
        />
      )}
    </div>
  );
};

export default HomePage;
