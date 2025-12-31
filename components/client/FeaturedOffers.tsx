
import React, { useState, useEffect } from 'react';
import { FeaturedOffer, TravelRequest } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Tag from '../shared/Tag';
import { useTranslation } from '../../context/LanguageContext';

interface FeaturedOffersProps {
  onSelect: (offerDetails: Partial<TravelRequest>, partnerId: string) => void;
}

const OfferSkeleton: React.FC = () => (
    <div className="relative h-72 sm:h-96 w-full rounded-[var(--radius-card)] bg-slate-800 animate-pulse border-[var(--border-width)] border-[var(--border-color)] overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-end p-6 space-y-3">
            <div className="h-4 w-24 bg-slate-700 rounded"></div>
            <div className="h-8 w-3/4 bg-slate-700 rounded"></div>
        </div>
    </div>
);

const OfferCard: React.FC<{ offer: FeaturedOffer; onSelect: () => void }> = ({ offer, onSelect }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={onSelect}
      className="relative h-72 sm:h-96 w-full rounded-[var(--radius-card)] overflow-hidden shadow-2xl cursor-pointer group transition-all duration-500 border-[var(--border-width)] border-[var(--border-color)] hover:border-primary/50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <img src={offer.imageUrl} alt={offer.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10"></div>
      
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-white z-20">
        <p className="text-xs font-black uppercase tracking-widest text-primary/90 mb-2">{offer.partnerName}</p>
        <h3 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md">{offer.title}</h3>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {offer.tags.map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{t('global.from')}</span>
                <div className="text-xl sm:text-2xl font-black text-white">
                    {offer.price.toLocaleString()} <span className="text-xs font-bold text-slate-300">{t('global.sar')}</span>
                </div>
            </div>
            <div className="bg-primary text-white text-[10px] sm:text-xs font-black py-2.5 px-5 rounded-xl group-hover:scale-105 transition-transform shadow-lg">
                {t('global.goTo')} {offer.requestDetails.to}
            </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedOffers: React.FC<FeaturedOffersProps> = ({ onSelect }) => {
  const { featuredOffers } = useAppContext();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  if (!isLoading && (!featuredOffers || featuredOffers.length === 0)) return null;

  return (
    <div className="mb-20">
      <div className="text-center mb-10 px-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-xl">{t('requestForm.featuredOffersTitle')}</h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto font-medium">{t('requestForm.featuredOffersSubtitle')}</p>
      </div>
      
      <div className="w-full overflow-x-auto pb-8 scrollbar-hide px-4">
          <div className="grid grid-flow-col auto-cols-[85vw] sm:auto-cols-[420px] gap-6">
              {isLoading ? (
                  [...Array(3)].map((_, i) => <OfferSkeleton key={i} />)
              ) : (
                  featuredOffers.map(offer => (
                    <OfferCard 
                      key={offer.id}
                      offer={offer}
                      onSelect={() => onSelect({ ...offer.requestDetails, budget: offer.price, tripDescription: `${offer.requestDetails.tripDescription}\n\n${offer.description}` }, offer.partnerId)}
                    />
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default FeaturedOffers;