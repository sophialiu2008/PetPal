
import React from 'react';
import { Page } from '../types';
import { translations, Language } from '../translations';

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
  triggerHaptic: () => void;
  language: Language;
}

const TabBar: React.FC<Props> = ({ activePage, onNavigate, triggerHaptic, language }) => {
  const t = translations[language];
  const tabs: { id: Page; icon: string; label: string }[] = [
    { id: 'home', icon: 'home', label: t.explore },
    { id: 'map', icon: 'map', label: t.map },
    { id: 'community', icon: 'groups', label: t.community },
    { id: 'messages', icon: 'chat', label: t.messages },
    { id: 'profile', icon: 'person', label: t.profile },
  ];

  return (
    <nav className="apple-blur bg-ios-blur dark:bg-dark-blur border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center pb-8 shadow-2xl z-50">
      {tabs.map((tab) => {
        const isActive = activePage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic();
              onNavigate(tab.id);
            }}
            className="flex flex-col items-center gap-1 transition-all"
          >
            <span 
              className={`material-symbols-outlined transition-all ${isActive ? 'text-ios-accent scale-110 fill-1' : 'text-ios-secondary'}`}
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className={`text-[10px] font-bold ${isActive ? 'text-ios-accent' : 'text-ios-secondary opacity-60'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;
