
import React, { useState, useEffect } from 'react';
import { Pet } from '../types';
import { PETS } from '../constants';

interface Props {
  onClose: () => void;
  onSelectPet: (pet: Pet) => void;
}

const SearchOverlay: React.FC<Props> = ({ onClose, onSelectPet }) => {
  const [query, setQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [results, setResults] = useState<Pet[]>(PETS);

  const personalities = ['Friendly', 'Active', 'Smart', 'Quiet', 'Playful', 'Brave'];
  const sizes = ['Small', 'Medium', 'Large'];

  const placeholderImg = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600";

  useEffect(() => {
    let filtered = PETS.filter(pet => {
      if (!pet) return false;
      const name = pet.name?.toLowerCase() || '';
      const breed = pet.breed?.toLowerCase() || '';
      const matchQuery = name.includes(query.toLowerCase()) || breed.includes(query.toLowerCase());
      
      const matchSize = selectedSize ? pet.size === selectedSize : true;
      
      const petPersonality = Array.isArray(pet.personality) ? pet.personality : [];
      const matchPersonality = selectedPersonalities.length > 0 
        ? selectedPersonalities.every(p => petPersonality.includes(p)) 
        : true;
      
      return matchQuery && matchSize && matchPersonality;
    });
    setResults(filtered);
  }, [query, selectedSize, selectedPersonalities]);

  const togglePersonality = (p: string) => {
    setSelectedPersonalities(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  return (
    <div className="fixed inset-0 z-[150] bg-ios-bg dark:bg-dark-bg flex flex-col animate-fade-in">
      {/* Header Search Bar */}
      <header className="pt-16 pb-4 px-6 apple-blur bg-ios-blur dark:bg-dark-blur/80 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center px-4 shadow-sm">
            <span className="material-symbols-outlined text-ios-secondary mr-2">search</span>
            <input 
              autoFocus
              type="text"
              placeholder="Search name or breed..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none dark:text-white font-medium text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <span className="material-symbols-outlined text-ios-secondary text-sm">close</span>
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-ios-accent font-bold text-sm px-2">Cancel</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Advanced Filters */}
        <div className="p-6 space-y-8">
          {/* Size Section */}
          <section className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xs font-black uppercase tracking-widest text-ios-secondary">Body Size</h3>
            <div className="flex gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                  className={`
                    flex-1 py-3 rounded-xl font-bold text-xs transition-all border
                    ${selectedSize === size 
                      ? 'bg-ios-accent text-white border-ios-accent shadow-lg shadow-ios-accent/20' 
                      : 'bg-white dark:bg-dark-card text-ios-secondary border-gray-100 dark:border-gray-800'}
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          {/* Personality Section */}
          <section className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xs font-black uppercase tracking-widest text-ios-secondary">Personality</h3>
            <div className="flex flex-wrap gap-2">
              {personalities.map(p => (
                <button
                  key={p}
                  onClick={() => togglePersonality(p)}
                  className={`
                    px-4 py-2 rounded-full text-xs font-bold transition-all border
                    ${selectedPersonalities.includes(p)
                      ? 'bg-ios-accent text-white border-ios-accent'
                      : 'bg-white dark:bg-dark-card text-ios-secondary border-gray-100 dark:border-gray-800'}
                  `}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* Results Section */}
          <section className="space-y-4 pt-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex justify-between items-baseline">
              <h3 className="text-xs font-black uppercase tracking-widest text-ios-secondary">Results</h3>
              <span className="text-[10px] font-bold text-ios-accent">{results.length} found</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {results.map((pet, i) => (
                <div 
                  key={pet.id}
                  onClick={() => onSelectPet(pet)}
                  className="bg-white dark:bg-dark-card p-3 rounded-2xl flex gap-4 shadow-sm active:scale-[0.98] transition-all"
                >
                  <img 
                    src={pet.image || placeholderImg} 
                    alt={pet.name} 
                    className="w-20 h-20 rounded-xl object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
                  />
                  <div className="flex-1 py-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <h4 className="font-extrabold dark:text-white truncate">{pet.name || 'Unnamed'}</h4>
                      <p className="text-[11px] text-ios-secondary font-medium truncate">
                        {pet.breed || 'Breed hidden'} • {pet.size || 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-1 overflow-hidden">
                      {Array.isArray(pet.personality) && pet.personality.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-ios-bg dark:bg-white/5 text-ios-secondary rounded whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center text-ios-accent">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </div>
                </div>
              ))}
              {results.length === 0 && (
                <div className="py-20 text-center space-y-2">
                  <span className="material-symbols-outlined text-4xl text-gray-200">sentiment_dissatisfied</span>
                  <p className="text-sm text-ios-secondary font-medium">No pets match your criteria.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
