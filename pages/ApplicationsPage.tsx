
import React from 'react';
import { AdoptionApplication } from '../types';

interface Props {
  onBack: () => void;
}

const ApplicationsPage: React.FC<Props> = ({ onBack }) => {
  const applications: AdoptionApplication[] = [
    { id: '1', petName: 'Bella', petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600', status: 'Interview', date: '2023-11-20' },
    { id: '2', petName: 'Mochi', petImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600', status: 'Reviewing', date: '2023-11-22' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-600';
      case 'Reviewing': return 'bg-blue-100 text-blue-600';
      case 'Interview': return 'bg-amber-100 text-amber-600';
      case 'Home Visit': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg transition-colors pt-16 flex flex-col">
      <header className="px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full bg-white dark:bg-dark-card shadow-sm active:scale-90 transition-all">
          <span className="material-symbols-outlined dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-2xl font-extrabold dark:text-white">My Applications</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 space-y-4 pt-4 pb-24 no-scrollbar">
        {applications.map((app, i) => (
          <div 
            key={app.id} 
            className="bg-white dark:bg-dark-card rounded-ios-lg p-4 shadow-sm animate-slide-up flex flex-col gap-4"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <img src={app.petImage} alt={app.petName} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
              <div className="flex-1">
                <h3 className="text-lg font-extrabold dark:text-white">{app.petName}</h3>
                <p className="text-xs text-ios-secondary font-medium uppercase tracking-wider">Applied on {app.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(app.status)}`}>
                {app.status}
              </span>
            </div>
            
            {/* Simple Step Indicator */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-50 dark:border-gray-800">
              {['Review', 'Interview', 'Home Visit', 'Final'].map((step, idx) => {
                const isActive = (app.status === 'Reviewing' && idx === 0) || 
                               (app.status === 'Interview' && idx <= 1) || 
                               (app.status === 'Home Visit' && idx <= 2) ||
                               (app.status === 'Approved' && idx <= 3);
                return (
                  <div key={step} className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-ios-accent shadow-[0_0_8px_rgba(242,13,89,0.5)]' : 'bg-gray-200 dark:bg-gray-800'}`} />
                    <span className={`text-[8px] font-bold ${isActive ? 'text-ios-accent' : 'text-ios-secondary opacity-40'}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <span className="material-symbols-outlined text-6xl text-gray-200">history_edu</span>
            <p className="text-ios-secondary font-medium">No active applications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
