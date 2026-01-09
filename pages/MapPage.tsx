
import React, { useEffect, useRef, useState } from 'react';
import { Pet, PetType } from '../types';
import { PETS } from '../constants';

declare const AMap: any;

interface Props {
  onSelectPet: (pet: Pet) => void;
  userLocation: { lat: number; lng: number } | null;
  isDarkMode: boolean;
}

const MapPage: React.FC<Props> = ({ onSelectPet, userLocation, isDarkMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PetType>('All');
  const [showSearchHere, setShowSearchHere] = useState(false);
  
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 模拟刷新当前区域的宠物
  const handleSearchThisArea = () => {
    setShowSearchHere(false);
    // 这里可以加入触觉反馈和加载动画
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  useEffect(() => {
    if (mapRef.current && typeof AMap !== 'undefined' && !mapInstance) {
      const map = new AMap.Map(mapRef.current, {
        zoom: 13,
        center: userLocation ? [userLocation.lng, userLocation.lat] : [-122.4194, 37.7749],
        mapStyle: isDarkMode ? 'amap://styles/dark' : 'amap://styles/light',
        viewMode: '3D',
        pitch: 35, // 稍微倾斜，更有空间感
      });

      setMapInstance(map);

      infoWindowRef.current = new AMap.InfoWindow({
        isCustom: true,
        offset: new AMap.Pixel(0, -60),
        autoMove: true,
        autoMoveOffset: 100,
      });

      // 监听地图拖动，显示“搜索此区域”
      map.on('moveend', () => setShowSearchHere(true));

      map.on('click', () => {
        infoWindowRef.current.close();
        setSelectedPet(null);
      });
    }
  }, [userLocation]);

  // 处理分类过滤
  useEffect(() => {
    if (!mapInstance) return;

    // 清除旧 Marker
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
        mapInstance.panTo(pos, 300); // 平滑移动
        
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

  // 实时同步地图样式
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setMapStyle(isDarkMode ? 'amap://styles/dark' : 'amap://styles/light');
    }
  }, [isDarkMode, mapInstance]);

  return (
    <div className="h-full relative overflow-hidden bg-ios-bg transition-colors duration-500">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      
      {/* 顶部综合搜索与过滤 */}
      <div className="absolute top-16 left-6 right-6 z-10 space-y-4">
        <div className="apple-blur bg-ios-blur dark:bg-dark-blur/90 h-14 rounded-2xl shadow-2xl border border-white/20 px-4 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined text-ios-secondary">search</span>
          <input 
            type="text" 
            placeholder="Search neighborhood..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 dark:text-white font-semibold outline-none text-sm" 
          />
          <button className="text-ios-accent"><span className="material-symbols-outlined">mic</span></button>
        </div>

        {/* 分类筛选 Pills */}
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

      {/* “搜索此区域”动态按钮 */}
      {showSearchHere && (
        <div className="absolute top-44 left-0 right-0 flex justify-center z-10 animate-badge-in">
          <button 
            onClick={handleSearchThisArea}
            className="apple-blur bg-ios-accent/90 text-white px-5 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-white/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Search this area
          </button>
        </div>
      )}

      {/* 右侧控制栏 */}
      <div className="absolute right-6 top-64 z-10 flex flex-col gap-3">
        <button 
          onClick={() => mapInstance?.setZoomAndCenter(15, [userLocation?.lng, userLocation?.lat])}
          className="apple-blur bg-ios-blur dark:bg-dark-blur p-3 rounded-full shadow-xl border border-white/20 active:scale-90 transition-all text-ios-accent"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
        <button className="apple-blur bg-ios-blur dark:bg-dark-blur p-3 rounded-full shadow-xl border border-white/20 active:scale-90 transition-all text-ios-secondary">
          <span className="material-symbols-outlined">layers</span>
        </button>
      </div>

      {/* 底部详情卡片 - 仅在未打开 InfoWindow 或需要更深交互时显示 */}
      {selectedPet && (
        <div className="absolute bottom-6 left-6 right-6 animate-slide-up z-30">
          <div 
            onClick={() => onSelectPet(selectedPet)}
            className="apple-blur bg-ios-blur dark:bg-dark-blur p-4 rounded-ios shadow-2xl border border-white/30 flex gap-4 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white/50">
              <img src={selectedPet.image} alt={selectedPet.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="flex-1 py-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black dark:text-white leading-tight">{selectedPet.name}</h3>
                  <span className="text-[10px] font-black text-ios-accent bg-ios-accent/10 px-2 py-0.5 rounded uppercase">
                    {selectedPet.distance}
                  </span>
                </div>
                <p className="text-xs text-ios-secondary font-bold mt-0.5 uppercase tracking-tighter opacity-80">{selectedPet.breed}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {selectedPet.personality.slice(0, 3).map((p, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-ios-accent/10 border border-white dark:border-dark-card flex items-center justify-center">
                       <span className="text-[8px] font-black text-ios-accent">{p[0]}</span>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-ios-secondary font-bold">Tap for details</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-ios-accent/5 flex items-center justify-center text-ios-accent group-hover:bg-ios-accent group-hover:text-white transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .amap-info-contentContainer {
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.2));
        }
        .marker-card {
           backface-visibility: hidden;
           -webkit-font-smoothing: subpixel-antialiased;
        }
      `}</style>
    </div>
  );
};

export default MapPage;
