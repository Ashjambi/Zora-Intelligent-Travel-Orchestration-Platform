
import * as React from 'react';
import { TravelRequest, PartnerOffer, PresentedOffer, TravelDay } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { PlaneIcon, UsersIcon, BotIcon, StarIcon, CheckCircleIcon, ChatBubbleIcon, ClockIcon, LifebuoyIcon, SparklesIcon, LightBulbIcon, ChartBarIcon, CheckBadgeIcon, CalendarIcon, MapPinIcon } from '../icons/Icons';
import ChatModal from '../shared/ChatModal';
import PaymentModal from '../shared/PaymentModal';
import Tag from '../shared/Tag';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import TripCommandCenter from './TripCommandCenter';
import ConsultationChatModal from './ConsultationChatModal';
import Modal from '../shared/Modal';
import AiPlanModal from './AiPlanModal';

interface RequestStatusProps {
  request: TravelRequest;
  isExpandedView?: boolean;
}

const ItineraryTimeline: React.FC<{ days: TravelDay[], title: string, color: 'primary' | 'blue' }> = ({ days, title, color }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${color === 'primary' ? 'text-primary' : 'text-blue-400'}`}>
                <CalendarIcon className="w-4 h-4" /> {title}
            </h4>
            <div className="space-y-3 pe-2">
                {days?.map((day, i) => (
                    <div key={i} className="relative ps-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-800">
                        <div className={`absolute left-[-3px] top-1 w-1.5 h-1.5 rounded-full ${color === 'primary' ? 'bg-primary' : 'bg-blue-400'}`}></div>
                        <p className="text-[10px] font-black text-white uppercase mb-1">{t('itinerary.day', { day: day.day })}: {day.title}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{day.activities?.[0]?.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
};

const RequestStatus: React.FC<RequestStatusProps> = ({ request, isExpandedView }) => {
  const { addChatMessage, selectFinalOffer, processClientPayment } = useAppContext();
  const { t, language } = useTranslation();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = React.useState(false);
  const [isAiPlanModalOpen, setIsAiPlanModalOpen] = React.useState(false);
  const [comparingOffer, setComparingOffer] = React.useState<PresentedOffer | null>(null);

  const stages = [
    { key: 'submitted', label: 'تم استلام الرؤية', active: true, icon: <CheckCircleIcon /> },
    { key: 'coordinating', label: 'استقطاب الشركاء', active: ['pending_bids', 'analyzing', 'offer_ready', 'confirmed'].includes(request.status), icon: <UsersIcon /> },
    { key: 'ai_analysis', label: 'تحليل زورا', active: ['analyzing', 'offer_ready', 'confirmed'].includes(request.status), icon: <BotIcon /> },
    { key: 'ready', label: 'العرض النهائي', active: ['offer_ready', 'confirmed'].includes(request.status), icon: <StarIcon /> }
  ];

  const handleSendMessage = (text: string) => {
    addChatMessage(request.id, 'client', { sender: 'Client', text, timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }) });
  };
  
  const handleSelectOffer = (offer: PartnerOffer) => {
    selectFinalOffer(request.id, offer.id);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className={isExpandedView ? "" : "animate-fade-in-up"}>
      <Card className={`p-0 overflow-hidden shadow-2xl border-white/5 bg-slate-900/60 ${isExpandedView ? 'rounded-t-none border-t-0 -mt-1' : ''}`}>
        {!isExpandedView && (
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <PlaneIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">{request.to}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{t('requestStatus.requestId', {id: request.id.split('-')[1].substring(0,6)})}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     {request.expertAnalysis && (
                        <button onClick={() => setIsConsultationOpen(true)} className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/20 text-blue-400 transition-all flex items-center gap-2">
                            <BotIcon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('requestStatus.consultationButton')}</span>
                        </button>
                     )}
                     <button onClick={() => setIsChatOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-2">
                         <ChatBubbleIcon className="w-5 h-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{t('requestStatus.chatButton')}</span>
                     </button>
                     <Tag color={request.status === 'offer_ready' ? 'yellow' : 'blue'}>{t(`enums.requestStatus.${request.status}`)}</Tag>
                </div>
            </div>
        )}

        <div className="p-8">
            {(request.status === 'offer_ready' || request.status === 'pending_payment') && request.presentedOffers ? (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <SparklesIcon className="w-5 h-5 text-primary" />
                            {t('requestStatus.comparisonTitle')}
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {request.presentedOffers?.map(offer => (
                            <div key={offer.id} className={`glass-card !bg-slate-950/60 p-6 border transition-all flex flex-col group ${offer.isRecommended ? 'border-green-500/40 ring-2 ring-green-500/20' : 'border-primary/10 hover:border-primary/40'}`}>
                                 <div className="flex justify-between items-start mb-6">
                                     <div>
                                         <div className="flex items-center gap-2 mb-2">
                                            <Tag color="blue">{offer.category}</Tag>
                                            {offer.isRecommended && (
                                                <Tag color="green">
                                                    <SparklesIcon className="w-4 h-4 me-1.5"/>
                                                    {t('requestStatus.recommendedByZora')}
                                                </Tag>
                                            )}
                                         </div>
                                         <h4 className="text-lg font-black text-white">{offer.partnerName}</h4>
                                     </div>
                                     <div className="text-right">
                                         <span className="text-primary font-black text-2xl">{offer.price.toLocaleString()}</span>
                                         <p className="text-[10px] text-slate-500 font-bold uppercase">{t('requestStatus.priceLabel')}</p>
                                     </div>
                                 </div>
                                 
                                 <p className="text-xs text-slate-400 italic mb-6 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-white/5">"{offer.justification}"</p>
                                 
                                 <div className="flex gap-2 mb-6">
                                     <Button onClick={() => setComparingOffer(offer)} variant="secondary" className="flex-1 !py-2.5 !text-[10px] !rounded-xl !bg-blue-500/10 !text-blue-400 !border-blue-500/20">
                                         {t('requestStatus.comparePlansButton')}
                                     </Button>
                                     <Button onClick={() => handleSelectOffer(offer)} className="flex-1 !py-2.5 !text-[10px] !rounded-xl shadow-xl">
                                         {t('requestStatus.confirmSelectionButton')}
                                     </Button>
                                 </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                     <BotIcon className="w-16 h-16 text-primary mb-6 animate-bounce" />
                     <h3 className="text-xl font-black text-white mb-2">{t('requestStatus.awaitingOffersTitle')}</h3>
                     <p className="text-slate-400 text-xs max-w-sm">{t('requestStatus.awaitingOffersSubtitle')}</p>
                     {['confirmed', 'payment_released', 'completed'].includes(request.status) && (
                         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                            <Button onClick={() => setIsCommandCenterOpen(true)} className="!px-8 !py-4 shadow-2xl">
                               {t('requestStatus.commandCenterButton')}
                            </Button>
                            <Button onClick={() => setIsAiPlanModalOpen(true)} variant="secondary" className="!px-8 !py-4 !bg-blue-500/10 !text-blue-400 !border-blue-500/20">
                                {t('requestStatus.generateAiPlanButton')}
                            </Button>
                         </div>
                     )}
                </div>
            )}
        </div>
        
        {isExpandedView && (
             <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 rounded-b-[var(--radius-card)]">
                 {request.expertAnalysis && (
                    <button onClick={() => setIsConsultationOpen(true)} className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/20 text-blue-400 transition-all flex items-center gap-2">
                        <BotIcon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('requestStatus.consultationButton')}</span>
                    </button>
                 )}
                 <button onClick={() => setIsChatOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-2">
                     <ChatBubbleIcon className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{t('requestStatus.chatButton')}</span>
                 </button>
            </div>
        )}
      </Card>

      <Modal isOpen={!!comparingOffer} onClose={() => setComparingOffer(null)} title={t('requestStatus.comparisonModalTitle')} size="xl">
            {comparingOffer && request.presentedOffers && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className={`grid grid-cols-1 ${request.presentedOffers.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
                        {request.presentedOffers.map(offer => (
                            <div key={offer.id} className="flex flex-col p-5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                                <div className="pb-4 border-b border-slate-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Tag color="blue">{offer.category}</Tag>
                                                {offer.isRecommended && (
                                                    <Tag color="green">
                                                        <SparklesIcon className="w-3 h-3 me-1" />
                                                        {t('requestStatus.recommendedByZora')}
                                                    </Tag>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-black text-white mt-2">{offer.partnerName}</h4>
                                        </div>
                                        <div className="text-right flex-shrink-0 ps-2">
                                            <span className="text-primary font-black text-2xl">{offer.price.toLocaleString()}</span>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{t('global.sar')}</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 italic mt-3 leading-relaxed">"{offer.justification}"</p>
                                </div>
                                
                                <div className="py-4 flex-grow">
                                    {offer.itinerary && offer.itinerary.length > 0 ? (
                                        <ItineraryTimeline days={offer.itinerary} title={t('requestStatus.realisticPath')} color="blue" />
                                    ) : (
                                        <div className="text-center py-10 h-full flex items-center justify-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                                            <p className="text-[10px] text-slate-500 font-bold">{t('requestStatus.noItineraryFromPartner')}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-4 mt-auto">
                                    <Button onClick={() => handleSelectOffer(offer)} className="w-full shadow-lg">
                                        {t('requestStatus.selectPartnerPlanButton')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-6 border-t border-slate-800 flex justify-end">
                        <Button variant="secondary" onClick={() => setComparingOffer(null)}>{t('requestStatus.closeComparisonButton')}</Button>
                    </div>
                </div>
            )}
      </Modal>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} title={t('requestStatus.chatTitle', { destination: request.to })} messages={request.chatHistory || []} onSendMessage={handleSendMessage} currentUser="Client" />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} amount={request.finalOffer?.price || 0} onConfirm={() => processClientPayment(request.id)} requestId={request.id} />
      {isCommandCenterOpen && <TripCommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} request={request} />}
      {isConsultationOpen && request.expertAnalysis && <ConsultationChatModal isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} request={request} />}
      {isAiPlanModalOpen && <AiPlanModal isOpen={isAiPlanModalOpen} onClose={() => setIsAiPlanModalOpen(false)} request={request} />}
    </div>
  );
};

export default RequestStatus;
