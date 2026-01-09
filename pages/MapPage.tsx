
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

interface ShelterInfo {
  title: string;
  uri: string;
  location?: any; // AMap.LngLat
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

  // Function to accurately geolocate shelter titles using AMap PlaceSearch
  const geolocateShelter = (title: string): Promise<any | null> => {
    return new Promise((resolve) => {
      if (typeof AMap === 'undefined' || !mapInstance) return resolve(null);
      const placeSearch = new AMap.PlaceSearch({
        city: '全国',
        pageSize: 1
      });
      placeSearch.search(title, (status: string, result: any) => {
        if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
          resolve(result.poiList.pois[0].location);
        } else {
          resolve(null);
        }
      });
    });
  };

  const findNearbyShelters = async () => {
    if (!userLocation || isSearchingShelters) return;
    setIsSearchingShelters(true);
    infoWindowRef.current.close();

    // Clear previous shelter markers
    shelterMarkers.forEach(m => m.setMap(null));
    setShelterMarkers([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const prompt = language === 'en' 
        ? "Find 5 pet adoption shelters or animal rescues specifically within a 5km radius of my current location. List their full names and provide their Google Maps links." 
        : "查找我当前位置 5 公里范围内的 5 个宠物领养中心或动物救助站。列出它们的完整名称并提供 Google 地图链接。";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: prompt,
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
      if (groundingChunks && groundingChunks.length > 0 && mapInstance) {
        const shelters: ShelterInfo[] = [];
        
        // Parse results from grounding metadata
        for (const chunk of groundingChunks) {
          if (chunk.maps) {
            const shelter: ShelterInfo = {
              title: chunk.maps.title,
              uri: chunk.maps.uri
            };
            // Attempt accurate location parsing via PlaceSearch
            const loc = await geolocateShelter(shelter.title);
            if (loc) shelter.location = loc;
            shelters.push(shelter);
          }
        }

        if (shelters.length > 0) {
          const newMarkers: any[] = [];
          
          // Place individual markers for each geocoded shelter
          shelters.forEach((shelter) => {
            if (shelter.location) {
              const marker = new AMap.Marker({
                position: shelter.location,
                content: `
                  <div class="relative flex flex-col items-center group cursor-pointer animate-pop">
                    <div class="bg-ios-accent w-10 h-10 rounded-full border-2 border-white dark:border-dark-card flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-xl">home_health</span>
                    </div>
                    <div class="bg-white dark:bg-dark-card px-2 py-0.5 rounded-lg shadow-md mt-1 border border-gray-100 dark:border-gray-800">
                      <span class="text-[8px] font-black uppercase text-ios-text dark:text-white whitespace-nowrap">${shelter.title.split(' ')[0]}</span>
                    </div>
                  </div>
                `,
                offset: new AMap.Pixel(-20, -20),
              });

              marker.on('click', () => showShelterList(shelters, shelter.location));
              marker.setMap(mapInstance);
              newMarkers.push(marker);
            }
          });

          // Add a central "Search Center" marker if multiple results found
          const centerPos = [userLocation.lng, userLocation.lat];
          const summaryMarker = new AMap.Marker({
            position: centerPos,
            content: `
              <div class="bg-ios-accent/20 w-16 h-16 rounded-full flex items-center justify-center animate-pulse">
                <div class="bg-ios-accent w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
            `,
            offset: new AMap.Pixel(-32, -32),
            zIndex: 10
          });
          summaryMarker.on('click', () => showShelterList(shelters, centerPos));
          summaryMarker.setMap(mapInstance);
          newMarkers.push(summaryMarker);

          setShelterMarkers(newMarkers);
          
          // Show the list immediately at the search center
          showShelterList(shelters, centerPos);
          
          // Adjust view
          mapInstance.setZoom(14, true);
          mapInstance.panTo(centerPos);
          
          if ('vibrate' in navigator) navigator.vibrate([40, 60, 40]);
        }
      }
    } catch (error) {
      console.error("Shelter search error:", error);
    } finally {
      setIsSearchingShelters(false);
    }
  };

  const showShelterList = (shelters: ShelterInfo[], position: any) => {
    const listHtml = shelters.map((s, idx) => `
      <div class="flex items-center justify-between gap-4 p-4 ${idx !== shelters.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''} hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
        <div class="flex-1 min-w-0">
          <p class="font-bold text-ios-text dark:text-white text-[14px] truncate leading-tight">${s.title}</p>
          <p class="text-[10px] text-ios-secondary font-bold uppercase tracking-widest mt-0.5">Verified Shelter</p>
        </div>
        <a href="${s.uri}" target="_blank" class="flex-shrink-0 bg-ios-accent text-white h-8 px-4 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all shadow-md">
          Visit
        </a>
      </div>
    `).join('');

    const infoContent = `
      <div class="apple-blur bg-ios-blur/95 dark:bg-dark-blur/95 rounded-ios-lg shadow-2xl border border-white/40 min-w-[300px] overflow-hidden animate-pop">
        <header class="bg-ios-accent p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl">map</span>
            <h3 class="font-black text-sm uppercase tracking-widest">Nearby Results</h3>
          </div>
          <span class="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black">${shelters.length}</span>
        </header>
        <div class="max-h-[300px] overflow-y-auto no-scrollbar">
          ${listHtml}
        </div>
        <footer class="p-3 bg-gray-50/50 dark:bg-black/20 text-center">
           <p class="text-[9px] text-ios-secondary font-bold uppercase tracking-tighter">Results found via Google Maps</p>
        </footer>
      </div>
    `;
    
    infoWindowRef.current.setContent(infoContent);
    infoWindowRef.current.open(mapInstance, position);
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
                    {isSearchingShelters ? 'progress_activity' : 'travel_explore'}
                </span>
                <span className="text-xs uppercase tracking-widest">{isSearchingShelters ? 'Searching...' : t.findShelters}</span>
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
                  ? 'bg-ios-accent text-white border-ios-accent shadow-lg shadow-ios-accent/30' 
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
            <div className="flex-1 py-1 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black dark:text-white leading-tight truncate">{selectedPet.name}</h3>
                </div>
                <p className="text-xs text-ios-secondary font-bold mt-0.5 uppercase tracking-tighter opacity-80 truncate">{selectedPet.breed}</p>
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
