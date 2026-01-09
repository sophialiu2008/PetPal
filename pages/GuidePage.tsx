
import React from 'react';

const GuidePage: React.FC = () => {
  const articles = [
    {
      title: 'Nutrition 101: Best Foods for Puppies',
      category: 'Diet',
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400',
      color: 'bg-green-500'
    },
    {
      title: 'Common Health Signs to Watch For',
      category: 'Medical',
      image: 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80&w=400',
      color: 'bg-red-500'
    },
    {
      title: 'Positive Reinforcement Training',
      category: 'Training',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400',
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg transition-colors pt-24 px-6 space-y-8 overflow-y-auto no-scrollbar pb-24">
      <div className="space-y-1">
        <p className="text-ios-accent font-bold uppercase tracking-widest text-xs">Essentials</p>
        <h1 className="text-4xl font-extrabold dark:text-white">Pet Care Guide</h1>
      </div>

      <div className="space-y-6">
        {articles.map((art, i) => (
          <div key={i} className="group relative rounded-ios overflow-hidden h-64 shadow-xl active:scale-95 transition-all cursor-pointer">
            <img src={art.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <span className={`${art.color} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full`}>
                {art.category}
              </span>
              <h2 className="text-white text-2xl font-extrabold leading-tight">
                {art.title}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuidePage;
