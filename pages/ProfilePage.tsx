
import React from 'react';

interface Props {
  onAdopted: () => void;
  onApplications: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<Props> = ({ onAdopted, onApplications, onLogout }) => {
  const menuItems = [
    { label: 'My Submissions', icon: 'publish', color: 'text-blue-500' },
    { label: 'Favorites', icon: 'favorite', color: 'text-pink-500' },
    { label: 'Adoption Applications', icon: 'assignment', color: 'text-purple-500', onClick: onApplications, badge: '2' },
    { label: 'My Adopted Pets', icon: 'history', color: 'text-orange-500', onClick: onAdopted },
    { label: 'Achievement Badges', icon: 'military_tech', color: 'text-yellow-500' },
    { label: 'Settings', icon: 'settings', color: 'text-gray-500' },
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
          <button className="absolute bottom-1 right-1 bg-ios-accent p-2 rounded-full text-white shadow-lg">
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
                <span className="bg-ios-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full">
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
        Log Out
      </button>
    </div>
  );
};

export default ProfilePage;
