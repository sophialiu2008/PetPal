
import React from 'react';
import { Pet } from '../types';

interface Props {
  pet: Pet;
  onBack: () => void;
  onApply: () => void;
}

const DetailsPage: React.FC<Props> = ({ pet, onBack, onApply }) => {
  // Defensive check for missing pet object
  if (!pet) {
    return (
      <div className="h-full bg-ios-bg dark:bg-dark-bg flex flex-col items-center justify-center p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-ios-secondary mb-4">error</span>
        <h2 className="text-2xl font-bold dark:text-white mb-2">Pet Details Unavailable</h2>
        <p className="text-ios-secondary mb-6">We couldn't find the information for this pet. It might have been adopted already.</p>
        <button onClick={onBack} className="bg-ios-accent text-white px-8 py-3 rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  // Helper to parse age string safely
  const getAgeParts = (age: string) => {
    if (typeof age !== 'string' || !age.trim()) return { val: 'N/A', unit: 'Age' };
    const parts = age.trim().split(' ');
    return {
      val: parts[0] || 'N/A',
      unit: parts.length > 1 ? parts[1] : 'Age'
    };
  };

  const ageData = getAgeParts(pet.age);
  const placeholderImg = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600";

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg flex flex-col relative overflow-hidden">
      {/* Top Navigation Overlay */}
      <div className="absolute top-12 left-0 right-0 z-50 px-6 flex justify-between items-center pointer-events-none">
        <button 
          onClick={onBack}
          className="pointer-events-auto bg-white/30 backdrop-blur-md p-3 rounded-full text-white shadow-xl active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button className="pointer-events-auto bg-white/30 backdrop-blur-md p-3 rounded-full text-white shadow-xl active:scale-90 transition-all">
          <span className="material-symbols-outlined">favorite</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {/* Parallax Hero Image */}
        <div className="relative h-[45vh] w-full bg-gray-200 dark:bg-gray-800">
          <img 
            src={pet.image || placeholderImg} 
            alt={pet.name || 'Pet'} 
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content Card */}
        <div className="relative -mt-10 bg-ios-bg dark:bg-dark-bg rounded-t-ios-lg p-8 space-y-8 min-h-[70vh]">
          {/* Main Info */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-extrabold dark:text-white">{pet.name || 'Unnamed Pet'}</h1>
                <span className={`material-symbols-outlined text-2xl ${pet.gender === 'Female' ? 'text-pink-500' : 'text-blue-500'}`}>
                  {pet.gender === 'Female' ? 'female' : 'male'}
                </span>
              </div>
              <p className="text-xl text-ios-secondary font-medium">{pet.breed || 'Unknown Breed'}</p>
            </div>
            {/* Status Badge */}
            <div 
              className={`
              px-4 py-2 rounded-2xl shadow-sm animate-badge-in transition-all duration-500
              ${pet.adoptionStatus === 'Available' ? 'bg-emerald-100 text-emerald-600' : 
                pet.adoptionStatus === 'Adopted' ? 'bg-gray-100 text-gray-500' : 
                'bg-amber-100 text-amber-600'}
            `}>
              <p className="font-bold text-sm uppercase tracking-wide">{pet.adoptionStatus || 'Available'}</p>
            </div>
          </div>

          {/* Stat Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-dark-card p-4 rounded-ios text-center shadow-sm">
              <p className="text-ios-text dark:text-white text-lg font-extrabold">{ageData.val}</p>
              <p className="text-ios-secondary text-xs uppercase font-bold opacity-60">{ageData.unit}</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-4 rounded-ios text-center shadow-sm">
              <p className="text-ios-text dark:text-white text-lg font-extrabold">{pet.weight || 'N/A'}</p>
              <p className="text-ios-secondary text-xs uppercase font-bold opacity-60">Weight</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-4 rounded-ios text-center shadow-sm">
              <p className="text-ios-text dark:text-white text-lg font-extrabold">{pet.distance || 'Unknown'}</p>
              <p className="text-ios-secondary text-xs uppercase font-bold opacity-60">Distance</p>
            </div>
          </div>

          {/* Owner Info */}
          <div className="flex items-center justify-between bg-white dark:bg-dark-card p-4 rounded-ios shadow-sm">
            <div className="flex items-center gap-4">
              <img 
                src={pet.owner?.avatar || "https://i.pravatar.cc/150?u=placeholder"} 
                alt={pet.owner?.name || 'Owner'} 
                className="w-12 h-12 rounded-full border-2 border-ios-accent/20 object-cover" 
              />
              <div>
                <h3 className="font-extrabold dark:text-white">{pet.owner?.name || 'Caregiver'}</h3>
                <p className="text-xs text-ios-secondary">{pet.owner?.location || 'Location hidden'}</p>
              </div>
            </div>
            <button className="bg-ios-bg dark:bg-black p-3 rounded-full text-ios-accent active:scale-90 transition-all">
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
          </div>

          {/* Personality Tags */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold dark:text-white">Personality</h3>
            <div className="flex gap-2 flex-wrap">
              {Array.isArray(pet.personality) && pet.personality.length > 0 ? (
                pet.personality.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white dark:bg-dark-card rounded-full text-sm font-bold text-ios-secondary shadow-sm">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-ios-secondary italic opacity-60">No traits listed yet.</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pb-32">
            <h3 className="text-xl font-bold dark:text-white">About {pet.name || 'this pet'}</h3>
            <p className="text-ios-secondary leading-relaxed text-lg font-medium opacity-80">
              {pet.description || "No detailed description provided. Contact the owner for more information about their background and needs."}
            </p>
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 apple-blur bg-ios-blur dark:bg-dark-blur z-50">
        <div className="flex gap-4">
          <button 
            disabled={pet.adoptionStatus === 'Adopted'}
            className={`
              flex-1 h-16 rounded-ios text-lg font-bold shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2
              ${pet.adoptionStatus === 'Adopted' 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-ios-accent text-white shadow-ios-accent/30'}
            `} 
            onClick={onApply}
          >
            <span className="material-symbols-outlined">pets</span>
            {pet.adoptionStatus === 'Adopted' ? 'Already Adopted' : 'Adopt Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
