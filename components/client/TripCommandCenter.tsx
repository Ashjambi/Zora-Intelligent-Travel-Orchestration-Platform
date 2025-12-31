
import React, { useState, useEffect } from 'react';
import { TravelRequest, SupportMessage, TripFeedItem } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { useAppContext } from '../../context/AppContext';
import Button from '../shared/Button';
import { BotIcon, CheckBadgeIcon, ExclamationTriangleIcon, LifebuoyIcon, ListBulletIcon, MapPinIcon, SunIcon, ClockIcon, SparklesIcon } from '../icons/Icons';
import TripFeed from './TripFeed';
import Spinner from '../shared/Spinner';
import Chat from '../shared/Chat';
import { getTripFeedUpdates } from '../../services/geminiService';

interface TripCommandCenterProps {
    isOpen: boolean;
    onClose: () => void;
    request: TravelRequest;
}

const VisualTimeline: React.FC<{ itinerary: string | undefined }> = ({ itinerary }) => {
    const { t } = useTranslation();
    const days = itinerary?.split('Day ').filter(Boolean).map(d => 'Day ' + d) || [];
    return (
        <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 rtl:before:left-auto rtl:before:right-4 before:w-0.5 before:bg-slate-800">
            {days.map((day, idx) => (
                <div key={idx} className="relative ps-10 rtl:ps-0 rtl:pe-10 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="absolute left-2 rtl:left-auto rtl:right-2 top-0 w-4.5 h-4.5 rounded-full bg-primary border-4 border-slate-950 z-10 shadow-[0_0_10px_rgba(255,107,107,0.5)]"></div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-primary/30 transition-all group">
                        <h4 className="font-black text-primary text-xs uppercase tracking-widest mb-2 group-hover:scale-105 transition-transform origin-left rtl:origin-right">
                           {day.split(':')[0]}
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            {day.split(':').slice(1).join(':').trim()}
                        </p>
                    </div>
                </div>
            ))}
            {days.length === 0 && <p className="text-center text-slate-500 py-10 italic">{t('tripCommandCenter.awaitingItinerary')}</p>}
        </div>
    );
};

const TripCommandCenter: React.FC<TripCommandCenterProps> = ({ isOpen, onClose, request }) => {
    const { t, language } = useTranslation();
    const { updateRequestStatus } = useAppContext();
    const [activeTab, setActiveTab] = useState<'live_feed' | 'itinerary' | 'support'>('live_feed');
    const [isUpdating, setIsUpdating] = useState(false);
    const [localFeed, setLocalFeed] = useState<TripFeedItem[]>(request.tripFeed || []);

    const handleGetUpdates = async () => {
        setIsUpdating(true);
        // Fix: Removed the extra language argument as getTripFeedUpdates only accepts destination and date
        const updates = await getTripFeedUpdates(request.to, request.departureDate);
        if (updates) setLocalFeed(prev => [...updates, ...prev]);
        setIsUpdating(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex justify-center items-center p-4" role="dialog" onClick={onClose}>
          <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-scale" onClick={e => e.stopPropagation()}>
            
            <div className="p-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1 block">{t('tripCommandCenter.pulseEngine')}</span>
                        <h3 className="text-3xl font-black text-white">{t('tripCommandCenter.title', { destination: request.to })}</h3>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full bg-slate-900 text-slate-500 hover:text-white transition-all shadow-inner border border-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="mt-8 flex gap-2 overflow-x-auto scrollbar-hide">
                     {[
                        { id: 'live_feed', icon: <SparklesIcon />, label: t('tripCommandCenter.liveFeedTab') },
                        { id: 'itinerary', icon: <ListBulletIcon />, label: t('tripCommandCenter.itineraryTab') },
                        { id: 'support', icon: <LifebuoyIcon />, label: t('tripCommandCenter.supportTab') }
                     ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-xl' : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'}`}
                        >
                            {React.cloneElement(tab.icon as any, { className: 'w-4 h-4' })}
                            {tab.label}
                        </button>
                     ))}
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950">
                {activeTab === 'live_feed' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-primary/5 border border-primary/20 p-6 rounded-[2rem]">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-2xl animate-pulse"><SunIcon className="w-8 h-8 text-primary" /></div>
                                <div>
                                    <p className="font-black text-white">{t('tripCommandCenter.weatherForecast')}</p>
                                    <p className="text-xs text-slate-400">{t('tripCommandCenter.weatherDescription', { destination: request.to })}</p>
                                </div>
                            </div>
                            <Button onClick={handleGetUpdates} loading={isUpdating} className="!py-2 !px-5 !text-[10px] shadow-lg">{t('tripCommandCenter.updateFeedButton')}</Button>
                        </div>
                        <TripFeed feedItems={localFeed} />
                    </div>
                )}
                {activeTab === 'itinerary' && <VisualTimeline itinerary={request.itinerary} />}
                {activeTab === 'support' && (
                    <div className="h-[500px]">
                        <Chat messages={request.supportMessages || []} onSendMessage={() => {}} currentUser="Client" isEmbedded={true} />
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/40 flex justify-center">
                 <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <ClockIcon className="w-4 h-4" />
                     {t('tripCommandCenter.lastUpdated', { time: new Date().toLocaleTimeString(t('global.locale'), { hour: '2-digit', minute: '2-digit' }) })}
                 </div>
            </div>
          </div>
        </div>
      );
};

export default TripCommandCenter;
