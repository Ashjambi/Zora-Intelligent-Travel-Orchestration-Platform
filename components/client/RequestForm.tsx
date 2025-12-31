
import React, { useState, useRef, useEffect } from 'react';
import { TravelRequest, ComfortLevel, TripType } from '../../types';
import { COMFORT_LEVELS, TRIP_TYPES } from '../../constants';
import Button from '../shared/Button';
import Card from '../shared/Card';
import * as Icons from '../icons/Icons';
import { analyzeTravelPrompt } from '../../services/geminiService';
import Notification from '../shared/Notification';
import { useAppContext } from '../../context/AppContext';
import FeaturedOffers from './FeaturedOffers';
import TripInspiration from './TripInspiration';
import { useTranslation } from '../../context/LanguageContext';
import Modal from '../shared/Modal';
import ClientAuth from './ClientAuth';

interface RequestFormProps {
    clientId: string | null;
    onComplete: () => void;
    onAuthSuccess: (clientId: string) => void;
}

const initialFormData: Partial<TravelRequest> = {
    from: '', to: '', departureDate: '', returnDate: '', travelers: 1, budget: 15000,
    tripType: TripType.RoundTrip, comfortLevel: ComfortLevel.Comfort, tripDescription: '',
    additionalServices: {
        wantsHotelBooking: false,
        wantsAirportTransfer: false, wantsCarRental: false, wantsPrivateDriver: false, 
        wantsActivities: false, wantsTravelInsurance: false, wantsVisaProcessing: false, 
        wantsDomesticTrips: false, wantsCorporateTravel: false, wantsVipServices: false, 
        wantsHoneymoonPackage: false, wantsDailyPrograms: false
    }
};

const serviceIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    wantsHotelBooking: Icons.BuildingOfficeIcon,
    wantsAirportTransfer: Icons.PlaneIcon,
    wantsCarRental: Icons.CarIcon,
    wantsPrivateDriver: Icons.UserGroupIcon,
    wantsActivities: Icons.StarIcon,
    wantsTravelInsurance: Icons.ShieldIcon,
    wantsVisaProcessing: Icons.ClipboardDocumentListIcon,
    wantsDomesticTrips: Icons.MapPinIcon,
    wantsCorporateTravel: Icons.BuildingOfficeIcon,
    wantsVipServices: Icons.CrownIcon,
    wantsHoneymoonPackage: Icons.SunIcon,
    wantsDailyPrograms: Icons.ListBulletIcon
};

const RequestForm: React.FC<RequestFormProps> = ({ clientId, onComplete, onAuthSuccess }) => {
  const { addRequest } = useAppContext();
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState<Partial<TravelRequest>>(initialFormData);
  const [expertAnalysis, setExpertAnalysis] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmittingAfterAuth, setIsSubmittingAfterAuth] = useState(false);

  useEffect(() => {
    if (clientId && isSubmittingAfterAuth) {
        setIsSubmittingAfterAuth(false);
        handleFinalSubmit();
    }
  }, [clientId, isSubmittingAfterAuth]);


  const handleAnalyze = async () => {
    if (!aiPrompt.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeTravelPrompt(aiPrompt);
    setIsAnalyzing(false);
    if (result) {
        setFormData(prev => ({ 
            ...prev, 
            to: result.to || prev.to,
            budget: result.budget || prev.budget,
            departureDate: result.departureDate || prev.departureDate,
            returnDate: result.returnDate || prev.returnDate,
            travelers: result.travelers || prev.travelers,
            tripDescription: result.tripDescription || prev.tripDescription,
            additionalServices: {
                ...prev.additionalServices,
                ...(result.recommendedServices?.reduce((acc: any, s: any) => { if(s.id) acc[s.id] = true; return acc; }, {}))
            }
        }));
        setExpertAnalysis(result);
        setChatHistory([{ role: 'model', parts: [{ text: result.expertAdvice }], nextSuggestions: result.suggestedQuestions }]);
        setTimeout(() => document.getElementById('logistics-section')?.scrollIntoView({ behavior: 'smooth' }), 500);
    }
  };

  const toggleService = (serviceId: string) => {
      setFormData(prev => ({
          ...prev,
          additionalServices: {
              ...prev.additionalServices,
              [serviceId]: !((prev.additionalServices as any)[serviceId])
          }
      }));
  };

  const handleFinalSubmit = () => {
      if (!clientId) {
          setIsSubmittingAfterAuth(true);
          setShowAuthModal(true);
          return;
      }
      addRequest({ ...formData, clientId, expertAnalysis, expertChatHistory: chatHistory } as any);
      setNotification({ message: language === 'ar' ? "تم إرسال طلبك بنجاح!" : "Request submitted successfully!", type: 'success' });
      setTimeout(() => onComplete(), 2000);
  };

  // Helper to format unknown keys if translation fails
  const getServiceLabel = (key: string) => {
      const translated = t(`services.${key}`);
      if (translated !== `services.${key}`) return translated;
      
      // Fallback formatting: flight_aggregator -> Flight Aggregator
      return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-20 pb-32">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      
      <TripInspiration onSelect={(d, p) => { setFormData(prev => ({...prev, to: d})); setAiPrompt(p); }} />
      <FeaturedOffers onSelect={(details, pid) => setFormData(prev => ({...initialFormData, ...details, originatingPartnerId: pid}))} />

      {/* Section 1: AI Prompting */}
      <Card className="p-10 border-primary/20 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 p-20 opacity-5 group-hover:opacity-10 transition-opacity"><Icons.SparklesIcon className="w-64 h-64 text-primary" /></div>
          <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-2xl"><Icons.BotIcon className="w-8 h-8 text-primary" /></div>
                  <div>
                      <h3 className="text-2xl font-black text-white">{t('requestForm.aiTitle')}</h3>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">{t('requestForm.aiRadarLabel')}</p>
                  </div>
              </div>
              <textarea 
                  value={aiPrompt} 
                  onChange={(e) => setAiPrompt(e.target.value)} 
                  rows={4} 
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-xl text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none leading-relaxed placeholder:text-slate-700"
                  placeholder={t('requestForm.aiPlaceholder')}
              />
              <div className="flex justify-center">
                  <Button type="button" onClick={handleAnalyze} loading={isAnalyzing} className="px-10 py-4 rounded-[2rem] text-lg font-black shadow-2xl shadow-primary/40">
                      {t('requestForm.analyzeButton')}
                  </Button>
              </div>
          </div>
      </Card>

      {expertAnalysis && (
        <div className="animate-fade-in-up">
            <Card className="p-8 border-blue-500/30 bg-slate-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Icons.ChartBarIcon className="w-40 h-40 text-blue-400" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Icons.BotIcon className="w-8 h-8 text-blue-400" />
                        <h3 className="text-2xl font-black text-white">{t('requestForm.strategicVisionTitle')}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('requestForm.valueScoreLabel')}</span>
                                    <span className="text-2xl font-black text-primary">{expertAnalysis.valueScore}/100</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${expertAnalysis.valueScore}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                                <p className="text-sm font-medium text-slate-300 italic leading-relaxed">
                                    "{expertAnalysis.expertAdvice}"
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">{t('requestForm.initialItineraryTitle')}</h4>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pe-2">
                                {expertAnalysis.detailedItinerary?.map((day: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-3 rounded-xl bg-slate-800/30 border border-white/5">
                                        <div className="flex-shrink-0 w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-black text-slate-500 text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{day.title}</p>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{day.activities?.[0]?.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      )}

      {/* Section 2: Structured Logistics */}
      <div id="logistics-section" className="space-y-10 animate-fade-in">
          <div className="px-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-4">
                <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                {t('requestForm.logisticsTitle')}
              </h3>
              <p className="text-slate-500 text-sm font-medium mt-2">{t('requestForm.logisticsSubtitle')}</p>
          </div>

          <Card className="p-10 border-white/5 bg-slate-900/40 rounded-[3rem] shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.from')}</label>
                    <div className="relative">
                        <input type="text" value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} className="form-input w-full ps-12" placeholder={t('requestForm.departureCityPlaceholder')} />
                        <Icons.MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.to')}</label>
                    <div className="relative">
                        <input type="text" value={formData.to} onChange={(e) => setFormData({...formData, to: e.target.value})} className="form-input w-full ps-12" placeholder={t('requestForm.destinationPlaceholder')} />
                        <Icons.PlaneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.tripType')}</label>
                    <select value={formData.tripType} onChange={(e) => setFormData({...formData, tripType: e.target.value as any})} className="form-input w-full">
                        {TRIP_TYPES.map(type => <option key={type} value={type}>{t(`enums.tripType.${type}`)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.departureDate')}</label>
                    <input type="date" value={formData.departureDate} onChange={(e) => setFormData({...formData, departureDate: e.target.value})} className="form-input w-full" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.returnDate')}</label>
                    <input type="date" value={formData.returnDate} onChange={(e) => setFormData({...formData, returnDate: e.target.value})} className="form-input w-full" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.budget')} ({t('global.sar')})</label>
                    <div className="relative">
                        <input type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})} className="form-input w-full ps-12 font-black text-primary text-xl" />
                        <Icons.RialSignIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.travelers')}</label>
                    <input type="number" value={formData.travelers} min="1" onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value)})} className="form-input w-full font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.comfortLevel')}</label>
                    <select value={formData.comfortLevel} onChange={(e) => setFormData({...formData, comfortLevel: e.target.value as any})} className="form-input w-full">
                        {COMFORT_LEVELS.map(level => <option key={level} value={level}>{t(`enums.comfortLevel.${level}`)}</option>)}
                    </select>
                  </div>
              </div>
          </Card>
      </div>

      {/* Section 3: Ancillary Services Grid */}
      <div className="space-y-10 animate-fade-in">
          <div className="px-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-4">
                <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
                {t('requestForm.additionalServicesTitle')}
              </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-0">
              {Object.entries(formData.additionalServices || {}).map(([key, isActive]) => {
                  const Icon = serviceIcons[key] || Icons.InfoIcon; // Fallback icon
                  return (
                      <button
                        key={key}
                        onClick={() => toggleService(key)}
                        className={`p-6 rounded-[2rem] border transition-all duration-500 flex flex-col items-center gap-4 group ${isActive ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-slate-900/40 border-white/5 hover:border-white/20'}`}
                      >
                          <div className={`p-4 rounded-2xl transition-all ${isActive ? 'bg-primary text-white scale-110' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                              <Icon className="w-6 h-6" />
                          </div>
                          <span className={`text-[11px] font-black uppercase text-center tracking-tighter ${isActive ? 'text-white' : 'text-slate-500'}`}>
                              {getServiceLabel(key)}
                          </span>
                      </button>
                  );
              })}
          </div>
      </div>

      <div className="pt-10 flex flex-col items-center gap-6">
          <Button onClick={handleFinalSubmit} className="w-full max-w-3xl !py-5 !text-2xl font-black !rounded-[2.5rem] shadow-2xl shadow-primary/40 active:scale-95 transition-all">
              {t('requestForm.submitFinal')}
          </Button>
          <p className="text-slate-600 text-xs font-bold">{t('requestForm.governanceAgreement')}</p>
      </div>

      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="">
          <ClientAuth onAuthenticated={(id) => { 
              setShowAuthModal(false);
              onAuthSuccess(id);
          }} />
      </Modal>
    </div>
  );
};

export default RequestForm;
