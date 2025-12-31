
import React, { useState, useEffect } from 'react';
import { getTrendingDestinations } from '../../services/geminiService';
import { useTranslation } from '../../context/LanguageContext';
import Spinner from '../shared/Spinner';
import * as Icons from '../icons/Icons';

interface Inspiration {
  destination: string;
  description: string;
  seed: string;
  prompt: string;
}

interface TripInspirationProps {
  onSelect: (destination: string, prompt: string) => void;
}

const ShimmerCard: React.FC<{ isLarge?: boolean }> = ({ isLarge = false }) => (
    <div className={`rounded-3xl bg-slate-800/60 relative overflow-hidden border border-slate-700/50 ${isLarge ? 'md:row-span-2 min-h-[30rem]' : 'min-h-[14.5rem]'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        <style>{`
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
        `}</style>
    </div>
);


const InspirationCard: React.FC<{ item: Inspiration; onSelect: () => void; isLarge?: boolean; index: number }> = ({ item, onSelect, isLarge = false, index }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imageUrl = `https://picsum.photos/seed/${item.seed}/${isLarge ? '800/800' : '400/400'}`;

    return (
        <div
            onClick={onSelect}
            className={`group relative overflow-hidden cursor-pointer rounded-3xl shadow-2xl shadow-black/30 border border-slate-700/50 transition-all duration-500 hover:border-primary/50 hover:shadow-primary/20 ${isLarge ? 'md:row-span-2 min-h-[30rem]' : 'min-h-[14.5rem]'}`}
            role="button"
            tabIndex={0}
        >
            {!isLoaded && <div className="absolute inset-0 bg-slate-800 flex items-center justify-center"><Spinner /></div>}
            
            <img 
                src={imageUrl} 
                alt={item.destination} 
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                <h1 className="absolute top-4 right-4 text-7xl font-black text-white/10 group-hover:text-white/20 transition-colors duration-500">#{index + 1}</h1>
                <h3 className={`font-black text-white drop-shadow-lg ${isLarge ? 'text-4xl' : 'text-2xl'}`}>
                    {item.destination}
                </h3>
                <p className={`text-white/80 mt-1 leading-tight ${isLarge ? 'text-sm' : 'text-xs'}`}>
                    {item.description}
                </p>
                <div className="mt-4 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-1/3 rounded-full"></div>
            </div>
        </div>
    );
};


const TripInspiration: React.FC<TripInspirationProps> = ({ onSelect }) => {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useTranslation();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        // Fix: Removed the extra language argument as getTrendingDestinations accepts 0 arguments
        const data = await getTrendingDestinations();
        if (active && data) setInspirations(data);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [language]);


  return (
    <div className="mb-20 animate-fade-in">
      <div className="px-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-3xl font-black text-white flex items-center gap-4">
            <Icons.GlobeAltIcon className="w-8 h-8 text-primary"/>
            {t('tripInspiration.title')}
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {t('tripInspiration.subtitle')}
          </p>
      </div>
      
      <div className="px-4">
        {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ShimmerCard isLarge />
                <ShimmerCard />
                <ShimmerCard />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {inspirations.map((item, index) => (
                    <InspirationCard
                        key={item.seed}
                        item={item}
                        onSelect={() => onSelect(item.destination, item.prompt)}
                        isLarge={index === 0}
                        index={index}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default TripInspiration;
