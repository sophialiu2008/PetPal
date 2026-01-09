
import React, { useState, useRef } from 'react';

interface Props {
  onBack: () => void;
}

const PostPage: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
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
      // Fix: Explicitly type the mapped file to File to satisfy URL.createObjectURL's parameter requirements
      const newImages = Array.from(files).map((file: File) => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg transition-colors pt-16 flex flex-col overflow-hidden">
      {/* iOS Style Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 apple-blur sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-ios-accent font-medium">
          Cancel
        </button>
        <h1 className="text-lg font-extrabold dark:text-white">Post Adoption</h1>
        <div className="w-12" /> {/* Spacer for centering */}
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-8 space-y-8">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center gap-2 mb-10">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-ios-accent shadow-[0_0_8px_rgba(242,13,89,0.3)]' : 'bg-gray-200 dark:bg-gray-800'}`}
              />
            ))}
          </div>

          {/* STEP 1: PHOTOS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold dark:text-white tracking-tight">Pet Photos</h2>
                <p className="text-ios-secondary font-medium">Add up to 5 clear photos of your pet.</p>
              </div>

              <input 
                type="file" 
                multiple 
                accept="image/*" 
                hidden 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
              />

              {images.length === 0 ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] bg-white dark:bg-dark-card rounded-ios-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-4 active:scale-[0.98] transition-all group"
                >
                  <div className="w-20 h-20 rounded-full bg-ios-bg dark:bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl text-ios-secondary">add_a_photo</span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold dark:text-white block">Upload Photos</span>
                    <span className="text-xs font-bold text-ios-secondary uppercase tracking-widest">Supports JPG, PNG</span>
                  </div>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Photo Carousel */}
                  <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-4 -mx-2 px-2">
                    {images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="relative flex-shrink-0 w-[75%] aspect-[3/4] rounded-ios overflow-hidden shadow-2xl snap-center animate-slide-up"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute top-4 right-4 bg-black/40 backdrop-blur-md w-10 h-10 rounded-full text-white flex items-center justify-center active:scale-90 transition-all"
                        >
                          <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                        <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">Image {idx + 1}</span>
                        </div>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 w-32 aspect-[3/4] bg-white dark:bg-dark-card rounded-ios border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-2xl text-ios-secondary">add</span>
                        <span className="text-[10px] font-bold text-ios-secondary uppercase tracking-widest text-center px-2">Add More</span>
                      </button>
                    )}
                  </div>
                  <p className="text-center text-[10px] font-bold text-ios-secondary uppercase tracking-widest">Swipe to preview all photos</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: BASIC INFO */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold dark:text-white tracking-tight">Basic Info</h2>
                <p className="text-ios-secondary font-medium">Tell us the essentials about your friend.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-ios-secondary ml-4">Pet Name</label>
                  <input 
                    placeholder="e.g. Buddy" 
                    value={petInfo.name}
                    onChange={(e) => setPetInfo({...petInfo, name: e.target.value})}
                    className="w-full h-16 bg-white dark:bg-dark-card rounded-ios px-6 font-bold shadow-sm focus:ring-2 focus:ring-ios-accent/20 transition-all outline-none dark:text-white" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-ios-secondary ml-4">Species</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Dog', 'Cat', 'Bird', 'Other'].map(type => (
                      <button
                        key={type}
                        onClick={() => setPetInfo({...petInfo, type})}
                        className={`h-14 rounded-ios font-bold transition-all border ${petInfo.type === type ? 'bg-ios-accent text-white border-ios-accent shadow-lg shadow-ios-accent/20' : 'bg-white dark:bg-dark-card text-ios-secondary border-transparent shadow-sm'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-ios-secondary ml-4">Age</label>
                    <input 
                      placeholder="e.g. 2 years" 
                      value={petInfo.age}
                      onChange={(e) => setPetInfo({...petInfo, age: e.target.value})}
                      className="w-full h-16 bg-white dark:bg-dark-card rounded-ios px-6 font-bold shadow-sm outline-none dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-ios-secondary ml-4">Breed</label>
                    <input 
                      placeholder="e.g. Poodle" 
                      value={petInfo.breed}
                      onChange={(e) => setPetInfo({...petInfo, breed: e.target.value})}
                      className="w-full h-16 bg-white dark:bg-dark-card rounded-ios px-6 font-bold shadow-sm outline-none dark:text-white" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STORY */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold dark:text-white tracking-tight">Their Story</h2>
                <p className="text-ios-secondary font-medium">Describe personality, habits, and health.</p>
              </div>

              <textarea 
                placeholder="Buddy is a energetic pup who loves..." 
                value={petInfo.description}
                onChange={(e) => setPetInfo({...petInfo, description: e.target.value})}
                className="w-full h-64 bg-white dark:bg-dark-card rounded-ios p-6 font-medium shadow-sm outline-none dark:text-white resize-none" 
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-8 pb-10 apple-blur bg-ios-blur/80 dark:bg-dark-blur/80 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="w-20 h-16 bg-white dark:bg-dark-card rounded-ios flex items-center justify-center text-ios-secondary shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
          )}
          <button 
            disabled={step === 1 && images.length === 0}
            onClick={() => {
              if (step < 3) {
                setStep(s => s + 1);
                if ('vibrate' in navigator) navigator.vibrate(10);
              } else {
                onBack();
              }
            }}
            className={`
              flex-1 h-16 rounded-ios font-bold text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2
              ${(step === 1 && images.length === 0) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-ios-accent text-white shadow-ios-accent/30'}
            `}
          >
            {step === 3 ? 'Publish' : 'Continue'}
            {step !== 3 && <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
