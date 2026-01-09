
import React from 'react';

interface Props {
  onBack: () => void;
}

const AdoptedPage: React.FC<Props> = ({ onBack }) => {
  const events = [
    { title: 'Adopted Mochi', date: 'Oct 12, 2023', icon: 'celebration', color: 'bg-ios-accent' },
    { title: 'First Vet Visit', date: 'Oct 15, 2023', icon: 'medical_services', color: 'bg-blue-500' },
    { title: 'New Achievement: Best Parent', date: 'Dec 01, 2023', icon: 'military_tech', color: 'bg-yellow-500' },
  ];

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg transition-colors pt-16 flex flex-col">
      <header className="px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full bg-white dark:bg-dark-card shadow-sm">
          <span className="material-symbols-outlined dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-2xl font-extrabold dark:text-white">Adoption Diary</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-10 pt-10 pb-24">
        <div className="relative border-l-2 border-ios-accent/20 pl-8 space-y-12">
          {events.map((ev, i) => (
            <div key={i} className="relative animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
              <div className={`absolute -left-[43px] top-0 w-8 h-8 rounded-full ${ev.color} flex items-center justify-center text-white shadow-lg`}>
                <span className="material-symbols-outlined text-lg">{ev.icon}</span>
              </div>
              <div className="bg-white dark:bg-dark-card p-6 rounded-ios shadow-sm border border-gray-50 dark:border-gray-800">
                <p className="text-ios-accent font-bold text-xs uppercase tracking-widest mb-1">{ev.date}</p>
                <h3 className="text-lg font-extrabold dark:text-white">{ev.title}</h3>
                <p className="text-ios-secondary text-sm font-medium mt-2">A beautiful milestone in your journey together.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdoptedPage;
