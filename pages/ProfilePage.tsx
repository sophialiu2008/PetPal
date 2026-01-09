
import React, { useState } from 'react';
import ImagenStudio from '../components/ImagenStudio.tsx';
import { translations, Language } from '../translations.ts';

interface Props {
  onAdopted: () => void;
  onApplications: () => void;
  onLogout: () => void;
  language: Language;
}

const ProfilePage: React.FC<Props> = ({ onAdopted, onApplications, onLogout, language }) => {
  const [showStudio, setShowStudio] = useState(false);
  const t = translations[language];

  const menuItems = [
    { label: language === 'en' ? 'My Submissions' : '我的发布', icon: 'publish', color: 'text-blue-500' },
    { label: language === 'en' ? 'Favorites' : '我的收藏', icon: 'favorite', color: 'text-pink-500' },
    { label: language === 'en' ? 'Adoption Applications' : '领养申请', icon: 'assignment', color: 'text-purple-500', onClick: onApplications, badge: '2' },
    { label: language === 'en' ? 'My Adopted Pets' : '已领养宠物', icon: 'history', color: 'text-orange-500', onClick: onAdopted },
    { label: language === 'en' ? 'Settings' : '设置', icon: 'settings', color: 'text-gray-500' },
  ];

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg transition-colors pt-24 px-6 space-y-8 overflow-y-auto no-scrollbar">
      {/* Header Profile */}
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <img 
            src="https://i.pravatar.cc/150?u=user123" 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-card shadow-2xl"
          />
          <button className="absolute bottom-1 right-1 bg-ios-accent p-2 rounded-full text-white shadow-lg active:scale-90 transition-all">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold dark:text-white">Alex Johnson</h1>
          <p className="text-ios-secondary font-medium">San Francisco, CA</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 bg-white dark:bg-dark-card p-6 rounded-ios shadow-sm">
        <div className="text-center border-r border-gray-100 dark:border-gray-800">
          <p className="text-xl font-extrabold dark:text-white">3</p>
          <p className="text-[10px] text-ios-secondary uppercase font-bold tracking-tight">Adopted</p>
        </div>
        <div className="text-center border-r border-gray-100 dark:border-gray-800">
          <p className="text-xl font-extrabold dark:text-white">12</p>
          <p className="text-[10px] text-ios-secondary uppercase font-bold tracking-tight">Favorites</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold dark:text-white">45</p>
          <p className="text-[10px] text-ios-secondary uppercase font-bold tracking-tight">Points</p>
        </div>
      </div>

      {/* AI Portrait Studio Promo Card */}
      <div 
        onClick={() => setShowStudio(true)}
        className="relative h-44 rounded-ios-lg overflow-hidden shadow-2xl group cursor-pointer active:scale-[0.98] transition-all"
      >
        <img 
          src="https://images.unsplash.com/photo-1541364983171-a8ba01d95cfc?auto=format&fit=crop&q=80&w=800" 
          alt="AI Studio" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 p-6 flex flex-col justify-center gap-2">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-ios-accent">palette</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{t.aiStudio}</span>
          </div>
          <h2 className="text-white text-2xl font-black leading-tight max-w-[200px]">
            {language === 'en' ? 'Turn your pet into a Masterpiece' : '将您的宠物变为艺术杰作'}
          </h2>
          <p className="text-white/60 text-xs font-medium">Powered by Imagen AI</p>
          <div className="mt-2">
             <span className="bg-ios-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Try Now</span>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white dark:bg-dark-card rounded-ios overflow-hidden shadow-sm">
        {menuItems.map((item, idx) => (
          <button 
            key={item.label}
            onClick={item.onClick}
            className={`
              w-full flex items-center justify-between p-4 transition-all active:bg-gray-50 dark:active:bg-black/20
              ${idx !== menuItems.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
              <span className="font-bold dark:text-white">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <span className="material-symbols-outlined text-gray-300">chevron_right</span>
            </div>
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout}
        className="w-full h-14 bg-red-50 text-red-500 font-bold rounded-ios active:scale-95 transition-all mb-12"
      >
        {language === 'en' ? 'Log Out' : '退出登录'}
      </button>

      {showStudio && <ImagenStudio onClose={() => setShowStudio(false)} language={language} />}
    </div>
  );
};

export default ProfilePage;
