
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Pet, PetType } from '../types.ts';
import { PETS } from '../constants.tsx';
import { translations, Language } from '../translations.ts';

declare const AMap: any;

interface Props {
  onSelectPet: (pet: Pet) => void;
  userLocation: { lat: number; lng: number } | null;
  isDarkMode: boolean;
  language: Language;
}

const MapPage: React.FC<Props> = ({ onSelectPet, userLocation, isDarkMode, language }) => {
  const t = translations[language];
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeCategory, setActiveCategory] = useState<PetType>('All');
  const [isSearchingShelters, setIsSearchingShelters] = useState(false);
  const [shelterMarkers, setShelterMarkers] = useState<any[]>([]);
  
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (mapRef.current && typeof AMap !== 'undefined' && !mapInstance) {
      const map = new AMap.Map(mapRef.current, {
        zoom: 13,
        center: userLocation ? [userLocation.lng, userLocation.lat] : [-122.4194, 37.7749],
        mapStyle: isDarkMode ? 'amap://styles/dark' : 'amap://styles/light',
        viewMode: '3D',
        pitch: 35,
      });

      setMapInstance(map);

      infoWindowRef.current = new AMap.InfoWindow({
        isCustom: true,
        offset: new AMap.Pixel(0, -60),
        autoMove: true,
      });

      map.on('click', () => {
        infoWindowRef.current.close();
        setSelectedPet(null);
      });
    }
  }, [userLocation]);

  const findNearbyShelters = async () => {
    if (!userLocation || isSearchingShelters) return;
    setIsSearchingShelters(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process?.env?.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: language === 'en' 
          ? "Find 3 pet adoption shelters or animal rescues near me." 
          : "查找我附近的3个宠物领养中心或动物救助站。",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.lat,
                longitude: userLocation.lng
              }
            }
          }
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks && mapInstance) {
        // Clear previous shelter markers
        shelterMarkers.forEach(m => m.setMap(null));
        const newMarkers: any[] = [];

        groundingChunks.forEach((chunk: any) => {
          if (chunk.maps) {
            // Simplified: we'd usually need geocoding for the URI, 
            // but for demo we'll place them near user
            const offset = (Math.random() - 0.5) * 0.05;
            const pos = [userLocation.lng + offset, userLocation.lat + offset];
            
            const marker = new AMap.Marker({
              position: pos,
              content: `<div class="bg-blue-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-white shadow-xl">
                <span class="material-symbols-outlined text-sm">home_health</span>
              </div>`,
              offset: new AMap.Pixel(-20, -20),
            });
            
            marker.on('click', () => {
              window.open(chunk.maps.uri, '_blank');
            });
            
            marker.setMap(mapInstance);
            newMarkers.push(marker);
          }
        });
        setShelterMarkers(newMarkers);
        if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
      }
    } catch (error) {
      console.error("Shelter search error:", error);
    } finally {
      setIsSearchingShelters(false);
    }
  };

  useEffect(() => {
    if (!mapInstance) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const filteredPets = PETS.filter(pet => {
      if (activeCategory === 'All') return true;
      const breed = pet.breed.toLowerCase();
      if (activeCategory === 'Dogs') return breed.includes('retriever') || breed.includes('bulldog') || breed.includes('husky');
      if (activeCategory === 'Cats') return breed.includes('shorthair') || breed.includes('siamese');
      return true;
    });

    filteredPets.forEach((pet) => {
      const offsetLng = (Math.random() - 0.5) * 0.04;
      const offsetLat = (Math.random() - 0.5) * 0.04;
      const pos = userLocation 
        ? [userLocation.lng + offsetLng, userLocation.lat + offsetLat]
        : [-122.4194 + offsetLng, 37.7749 + offsetLat];

      const markerContent = document.createElement('div');
      markerContent.className = 'relative flex flex-col items-center group cursor-pointer';
      markerContent.innerHTML = `
        <div class="marker-card w-14 h-14 rounded-full border-[3px] border-white dark:border-dark-card shadow-2xl overflow-hidden transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
          <img src="${pet.image}" style="width:100%; height:100%; object-fit:cover;" />
        </div>
        <div class="w-3 h-3 rotate-45 -mt-1.5 shadow-xl bg-white dark:bg-dark-card"></div>
      `;

      const marker = new AMap.Marker({
        position: pos,
        content: markerContent,
        offset: new AMap.Pixel(-28, -56),
      });

      marker.on('click', () => {
        setSelectedPet(pet);
        mapInstance.panTo(pos, 300);
        
        const infoContent = `
          <div class="apple-blur bg-ios-blur dark:bg-dark-blur p-3 rounded-2xl shadow-2xl border border-white/40 flex items-center gap-3 min-w-[220px] animate-pop">
            <img src="${pet.image}" style="width:54px; height:54px; border-radius:14px; object-fit:cover;" />
            <div style="flex:1;">
              <h4 class="font-black text-ios-text dark:text-white text-sm" style="margin:0;">${pet.name}</h4>
              <p class="text-ios-secondary text-[10px] font-bold uppercase tracking-tight" style="margin:0;">${pet.breed}</p>
            </div>
            <button id="view-pet-${pet.id}" class="bg-ios-accent text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        `;
        infoWindowRef.current.setContent(infoContent);
        infoWindowRef.current.open(mapInstance, pos);

        setTimeout(() => {
          const btn = document.getElementById(`view-pet-${pet.id}`);
          if (btn) btn.onclick = () => onSelectPet(pet);
        }, 50);
      });

      marker.setMap(mapInstance);
      markersRef.current.push(marker);
    });
  }, [activeCategory, mapInstance]);

  return (
    <div className="h-full relative overflow-hidden bg-ios-bg transition-colors duration-500">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      
      <div className="absolute top-16 left-6 right-6 z-10 space-y-4">
        <div className="flex gap-2 animate-slide-up">
            <button 
                onClick={findNearbyShelters}
                disabled={isSearchingShelters}
                className="flex-1 apple-blur bg-ios-accent/90 text-white h-12 rounded-2xl shadow-2xl border border-white/20 px-4 flex items-center justify-center gap-2 font-bold active:scale-95 transition-all disabled:opacity-50"
            >
                <span className={`material-symbols-outlined text-xl ${isSearchingShelters ? 'animate-spin' : ''}`}>
                    {isSearchingShelters ? 'progress_activity' : 'google_plus_resale'}
                </span>
                <span className="text-xs uppercase tracking-widest">{t.findShelters}</span>
            </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 animate-fade-in">
          {['All', 'Dogs', 'Cats', 'Small'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as PetType)}
              className={`
                px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm
                ${activeCategory === cat 
                  ? 'bg-ios-accent text-white border-ios-accent' 
                  : 'apple-blur bg-ios-blur dark:bg-dark-blur text-ios-secondary border-white/20 dark:text-gray-400'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {selectedPet && (
        <div className="absolute bottom-6 left-6 right-6 animate-slide-up z-30">
          <div 
            onClick={() => onSelectPet(selectedPet)}
            className="apple-blur bg-ios-blur dark:bg-dark-blur p-4 rounded-ios shadow-2xl border border-white/30 flex gap-4 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white/50">
              <img src={selectedPet.image} alt={selectedPet.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 py-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black dark:text-white leading-tight">{selectedPet.name}</h3>
                </div>
                <p className="text-xs text-ios-secondary font-bold mt-0.5 uppercase tracking-tighter opacity-80">{selectedPet.breed}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-ios-secondary font-bold">Tap for details</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="material-symbols-outlined text-ios-accent">chevron_right</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
