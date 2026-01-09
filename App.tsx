
import React, { useState, useEffect } from 'react';
import { Page, Pet } from './types';
import { PETS } from './constants';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import ProfilePage from './pages/ProfilePage';
import CommunityPage from './pages/CommunityPage';
import MapPage from './pages/MapPage';
import PostPage from './pages/PostPage';
import GuidePage from './pages/GuidePage';
import AdoptedPage from './pages/AdoptedPage';
import MessagesPage from './pages/MessagesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import TabBar from './components/TabBar';
import DynamicIsland from './components/DynamicIsland';
import AIAssistant from './components/AIAssistant';
import { translations, Language } from './translations';

declare const AMap: any;

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showIsland, setShowIsland] = useState(false);
  const [islandMessage, setIslandMessage] = useState('');
  const [showAI, setShowAI] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressName, setAddressName] = useState('Locating...');

  const t = translations[language];

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const durations = { light: 10, medium: 30, heavy: 60 };
      navigator.vibrate(durations[style]);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          if (typeof AMap !== 'undefined') {
            const geocoder = new AMap.Geocoder();
            geocoder.getAddress([longitude, latitude], (status: string, result: any) => {
              if (status === 'complete' && result.regeocode) {
                const component = result.regeocode.addressComponent;
                setAddressName(`${component.city || component.province} · ${component.district}`);
              }
            });
          }
        },
        (error) => {
          setAddressName(language === 'en' ? "Location Disabled" : "位置不可用");
        }
      );
    }
  }, [language]);

  const toggleDarkMode = () => {
    triggerHaptic('light');
    setIsDarkMode(!isDarkMode);
  };

  const toggleLanguage = () => {
    triggerHaptic('light');
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const navigate = (page: Page, pet?: Pet) => {
    triggerHaptic('light');
    if (pet) setSelectedPet(pet);
    setCurrentPage(page);
  };

  const handleApplyAdoption = () => {
    triggerHaptic('medium');
    setIslandMessage(language === 'en' ? "Application Sent! 🐾" : "申请已提交! 🐾");
    setShowIsland(true);
    setTimeout(() => setShowIsland(false), 3000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome': return <WelcomePage onStart={() => navigate('home')} language={language} />;
      case 'home': return <HomePage onSelectPet={(pet) => navigate('details', pet)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} toggleLanguage={toggleLanguage} language={language} currentLocation={addressName} />;
      case 'details': return selectedPet ? <DetailsPage pet={selectedPet} onBack={() => navigate('home')} onApply={handleApplyAdoption} language={language} /> : null;
      case 'profile': return <ProfilePage onApplications={() => navigate('applications')} onAdopted={() => navigate('adopted')} onLogout={() => navigate('welcome')} language={language} />;
      case 'community': return <CommunityPage language={language} />;
      case 'map': return <MapPage onSelectPet={(pet) => navigate('details', pet)} userLocation={userLocation} isDarkMode={isDarkMode} language={language} />;
      case 'post': return <PostPage onBack={() => navigate('home')} language={language} />;
      case 'guide': return <GuidePage language={language} />;
      case 'adopted': return <AdoptedPage onBack={() => navigate('profile')} language={language} />;
      case 'messages': return <MessagesPage language={language} />;
      case 'applications': return <ApplicationsPage onBack={() => navigate('profile')} language={language} />;
      default: return <HomePage onSelectPet={(pet) => navigate('details', pet)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} toggleLanguage={toggleLanguage} language={language} currentLocation={addressName} />;
    }
  };

  const showTabBar = !['welcome', 'details', 'post'].includes(currentPage);

  return (
    <div className="relative h-screen flex flex-col transition-colors duration-500">
      <DynamicIsland visible={showIsland} message={islandMessage} />
      <div className="flex-1 overflow-hidden relative">
        {renderPage()}
      </div>
      {showTabBar && currentPage === 'home' && (
        <button 
          onClick={() => { triggerHaptic('light'); setShowAI(true); }}
          className="fixed right-6 bottom-32 w-14 h-14 bg-white dark:bg-dark-card rounded-full shadow-2xl border-2 border-ios-accent/20 flex items-center justify-center z-40 active:scale-90 transition-all animate-float"
        >
          <span className="material-symbols-outlined text-ios-accent text-3xl">smart_toy</span>
        </button>
      )}
      {showAI && <AIAssistant onClose={() => setShowAI(false)} language={language} />}
      {showTabBar && <TabBar activePage={currentPage} onNavigate={navigate} triggerHaptic={triggerHaptic} language={language} />}
    </div>
  );
};

export default App;
