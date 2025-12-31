
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { TravelRequest, PartnerOffer, ChatMessage, ComfortLevel, FeaturedOffer } from '../../types';
import Card from '../shared/Card';
import OfferForm from './OfferForm';
import { PlaneIcon, CalendarIcon, UsersIcon, CheckCircleIcon, LightBulbIcon, ClockIcon, XCircleIcon, PlusCircleIcon, ClipboardDocumentListIcon, ArchiveBoxIcon, FunnelIcon, MapPinIcon, StarIcon, PencilSquareIcon, TrashIcon, BanknotesIcon, ChatBubbleIcon, ExclamationTriangleIcon, SendIcon, BotIcon, BuildingOfficeIcon } from '../icons/Icons';
import Button from '../shared/Button';
import Tag from '../shared/Tag';
import Notification, { NotificationType } from '../shared/Notification';
import ChatModal from '../shared/ChatModal';
import { useAppContext } from '../../context/AppContext';
import Modal from '../shared/Modal';
import PartnerFinancials from './PartnerFinancials';
import { useTranslation } from '../../context/LanguageContext';
import AcknowledgeOffer from './AcknowledgeOffer';
import { getAIOfferAdvice } from '../../services/geminiService';
import Spinner from '../shared/Spinner';
import FeaturedOfferFormModal from './FeaturedOfferFormModal';
import LegalAgreement from './LegalAgreement';

type OfferStatus = 'Pending' | 'Selected' | 'Accepted' | 'Rejected' | 'PaymentFailed' | 'NeedsRevision' | 'UnderReview';

interface SubmittedOffer extends PartnerOffer {
    requestTitle: string;
    requestId: string;
    status: OfferStatus;
    createdAt: string;
    adminRevisionNote?: string;
}

interface PartnerGatewayProps {
    activePartnerId: string | null;
}

const PartnerGateway: React.FC<PartnerGatewayProps> = ({ activePartnerId }) => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const { requests, partners, updatePartner, addOffer, addChatMessage, featuredOffers, addFeaturedOffer, updateFeaturedOffer, deleteFeaturedOffer } = useAppContext();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [view, setView] = useState<'action_required' | 'submitted' | 'featured' | 'financials'>('action_required');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeaturedOffer, setEditingFeaturedOffer] = useState<FeaturedOffer | null>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  
  const currentPartner = useMemo(() => partners.find(p => p.id === partnerId), [partners, partnerId]);
  
  const sessionPartnerId = activePartnerId || localStorage.getItem('orchestrator_partner_session');
  
  if (!sessionPartnerId || sessionPartnerId !== partnerId) {
    return <Navigate to="/partner-login" replace />;
  }

  const handleAcceptAgreement = () => {
      if (currentPartner) {
          updatePartner({
              ...currentPartner,
              agreementSignedAt: new Date().toISOString(),
              agreementVersion: "2.1"
          });
          setNotification({ message: language === 'ar' ? "تم تفعيل حساب الوكالة وتوقيع الاتفاقية بنجاح." : "Agent account activated and agreement signed.", type: 'success' });
      }
  };
  
  const handleOpenCreateForm = () => {
    setEditingFeaturedOffer(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (offer: FeaturedOffer) => {
    setEditingFeaturedOffer(offer);
    setIsFormOpen(true);
  };
  
  const handleSaveFeaturedOffer = (offerData: Omit<FeaturedOffer, 'id' | 'partnerId' | 'partnerName'> | FeaturedOffer) => {
    if ('id' in offerData) {
      updateFeaturedOffer(offerData as FeaturedOffer);
      setNotification({ message: t('partnerGateway.notifications.offerUpdated'), type: 'success' });
    } else if (currentPartner) {
      addFeaturedOffer(offerData, currentPartner.id);
      setNotification({ message: t('partnerGateway.notifications.offerCreated'), type: 'success' });
    }
    setIsFormOpen(false);
    setEditingFeaturedOffer(null);
  };

  const handleDeleteFeaturedOffer = (offerId: string) => {
    if (window.confirm(t('partnerGateway.notifications.confirmDelete'))) {
        deleteFeaturedOffer(offerId);
        setNotification({ message: t('partnerGateway.notifications.offerDeleted'), type: 'success' });
    }
  };

  const getArticles = () => {
      const articles = t('legal.partner.articles', { returnObjects: true });
      return Array.isArray(articles) ? articles : [];
  };


  const allPartnerOffers = useMemo((): SubmittedOffer[] => {
    if (!currentPartner) return [];
    return requests.flatMap(req => 
        req.offers
            .filter(offer => offer.partnerName === currentPartner.name)
            .map(offer => {
                let offerStatus: OfferStatus = 'UnderReview';
                if (offer.isRejected) offerStatus = 'NeedsRevision';
                else if (req.finalOffer?.id === offer.id && ['confirmed', 'payment_released', 'completed', 'payout_processing'].includes(req.status)) offerStatus = 'Accepted';
                else if (req.finalOffer?.id === offer.id && req.status === 'pending_payment') offerStatus = 'Selected';
                else if (req.finalOffer?.id === offer.id && req.status === 'payment_failed') offerStatus = 'PaymentFailed';
                else if (req.finalOffer && req.finalOffer.id !== offer.id) offerStatus = 'Rejected';

                return {
                    ...offer,
                    requestTitle: `${req.from} → ${req.to}`,
                    requestId: req.id,
                    status: offerStatus,
                    createdAt: req.createdAt,
                    adminRevisionNote: offer.revisionNote
                };
            })
      ).reverse();
  }, [requests, currentPartner]);

  const pendingRevisions = useMemo(() => {
      if (!currentPartner) return [];
      return requests.filter(req => 
          req.offers.some(o => o.partnerName === currentPartner.name && o.isRejected)
      );
  }, [requests, currentPartner]);

  const newRequests = useMemo(() => {
      if (!currentPartner) return [];
      return requests.filter(r => 
        (r.status === 'pending_bids' || (r.status === 'revision_requested')) && 
        !r.offers.some(o => o.partnerName === currentPartner.name) &&
        (!r.originatingPartnerId || r.originatingPartnerId === partnerId)
      );
  }, [requests, partnerId, currentPartner]);

  const partnerFeaturedOffers = useMemo(() => featuredOffers.filter(o => o.partnerId === partnerId), [featuredOffers, partnerId]);
  const selectedRequest = requests.find(r => r.id === selectedRequestId);
  const activeChatRequest = requests.find(r => r.id === activeChatRequestId);

  useEffect(() => {
    if (selectedRequest && !selectedRequest.originatingPartnerId) {
      const fetchAdvice = async () => {
        setIsAdviceLoading(true);
        setAiAdvice(null);
        const advice = await getAIOfferAdvice(selectedRequest);
        setAiAdvice(advice);
        setIsAdviceLoading(false);
      };
      fetchAdvice();
    }
  }, [selectedRequestId, language, selectedRequest]);
  
  const currentPartnerOffer = useMemo(() => {
      if (!currentPartner) return undefined;
      return selectedRequest?.offers.find(o => o.partnerName === currentPartner.name);
  }, [selectedRequest, currentPartner]);

  const handleUpdateOffer = (requestId: string, offer: Omit<PartnerOffer, 'id'>) => {
      addOffer(requestId, offer);
      setSelectedRequestId(null); 
      setNotification({ message: language === 'ar' ? "تم إرسال العرض بنجاح." : "Offer sent successfully.", type: 'success' });
  };

  const handleSendMessage = (text: string) => {
    const rId = selectedRequestId || activeChatRequestId;
    if (rId && currentPartner) {
      addChatMessage(rId, 'partner', {
          sender: currentPartner.name,
          text,
          timestamp: new Date().toLocaleTimeString(t('global.locale'), { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  if (!currentPartner) return <Navigate to="/partner-login" replace />;
  
  if (!currentPartner.agreementSignedAt) {
      return <LegalAgreement partnerName={currentPartner.name} onAccept={handleAcceptAgreement} />;
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-10">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      
       <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div className="text-center sm:text-right rtl:sm:text-left">
              <div className="flex items-center gap-4 mb-2 justify-center sm:justify-start">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t('partnerGateway.title')}</h2>
                <button 
                    onClick={() => setShowAgreementModal(true)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-400 hover:text-primary transition-all border border-slate-700"
                    title={t('global.viewAgreement')}
                >
                    <ClipboardDocumentListIcon className="w-3.5 h-3.5" />
                    {t('global.viewAgreement')}
                </button>
              </div>
              <p className="text-slate-400 text-sm">{t('partnerGateway.subtitle')} - {currentPartner.name}</p>
          </div>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-slate-900/60 p-2 rounded-2xl border border-slate-800 flex backdrop-blur-xl overflow-x-auto scrollbar-hide">
            <button onClick={() => setView('action_required')} className={`px-8 py-3.5 rounded-xl text-sm font-black transition-all flex items-center gap-3 whitespace-nowrap ${view === 'action_required' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}>
                {t('partnerGateway.tabs.activeTasks')} ({newRequests.length + pendingRevisions.length})
                {(pendingRevisions.length > 0 || newRequests.some(r => r.originatingPartnerId)) && <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>}
            </button>
            <button onClick={() => setView('submitted')} className={`px-8 py-3.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${view === 'submitted' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}>
                {t('partnerGateway.tabs.allOffers')} ({allPartnerOffers.length})
            </button>
            <button onClick={() => setView('featured')} className={`px-8 py-3.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${view === 'featured' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}>
                {t('partnerGateway.tabs.featured', { count: partnerFeaturedOffers.length })}
            </button>
            <button onClick={() => setView('financials')} className={`px-8 py-3.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${view === 'financials' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}>
                {t('partnerGateway.tabs.financials')}
            </button>
        </div>
      </div>

      {view === 'action_required' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-2 space-y-6">
                  {pendingRevisions.length > 0 && (
                      <div className="space-y-4">
                          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest ps-4 flex items-center gap-2">
                              <ExclamationTriangleIcon className="w-4 h-4 animate-bounce" /> {t('partnerGateway.tasks.revisionRequired')}
                          </h3>
                          {pendingRevisions.map(req => (
                                <Card key={req.id} onClick={() => setSelectedRequestId(req.id)} className={`p-5 border-red-500/50 bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition-all border-l-[6px] border-l-red-500 shadow-xl ${selectedRequestId === req.id ? 'ring-2 ring-red-500' : ''}`}>
                                    <p className="font-black text-white">{req.from} → {req.to}</p>
                                    <div className="bg-slate-950/80 p-3 rounded-xl border border-red-500/20 my-3">
                                        <p className="text-[11px] text-slate-300 font-medium italic">"{req.offers.find(o => o.partnerName === currentPartner.name)?.revisionNote}"</p>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase text-center py-1">{t('partnerGateway.tasks.clickToCorrect')}</p>
                                </Card>
                          ))}
                      </div>
                  )}

                  <div className="space-y-4 pt-4 border-t border-slate-800/60">
                      <h3 className="text-xs font-black text-primary uppercase tracking-widest ps-4 flex items-center gap-2">
                          <SendIcon className="w-4 h-4" /> {t('partnerGateway.tasks.newRequests')}
                      </h3>
                      {newRequests.length > 0 ? newRequests.map(req => (
                          <Card key={req.id} onClick={() => setSelectedRequestId(req.id)} className={`p-5 transition-all cursor-pointer border-slate-800 hover:border-primary/50 hover:bg-slate-800/40 ${selectedRequestId === req.id ? 'border-primary bg-primary/5 shadow-lg' : ''} ${req.originatingPartnerId ? 'border-purple-500/40 bg-purple-500/5' : ''}`}>
                              <div className="flex justify-between items-start">
                                  <p className="font-black text-white">{req.from} → {req.to}</p>
                                  {req.originatingPartnerId && <Tag color="purple">{t('partnerGateway.tasks.exclusiveRequest')}</Tag>}
                              </div>
                              <div className="flex justify-between items-center mt-3">
                                  <span className="text-primary font-black text-sm">{req.budget.toLocaleString()} {t('global.sar')}</span>
                                  <span className="text-[10px] font-mono text-slate-600 uppercase">#{req.id.split('-')[1].substring(0,6)}</span>
                              </div>
                          </Card>
                      )) : (
                          <div className="py-12 text-center opacity-30 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
                              <ArchiveBoxIcon className="w-10 h-10 mx-auto mb-3" />
                              <p className="text-xs font-bold uppercase tracking-widest">{t('partnerGateway.tasks.noRequests')}</p>
                          </div>
                      )}
                  </div>
              </div>

              <div className="lg:col-span-3">
                  {selectedRequest ? (
                      <div className="animate-fade-in-up">
                          {selectedRequest.originatingPartnerId === partnerId ? (
                              <AcknowledgeOffer request={selectedRequest} onAcknowledged={(msg) => { setSelectedRequestId(null); setNotification({ message: msg, type: 'success' }); }} />
                          ) : (
                            <>
                                <Card className="p-8 bg-slate-900 border-slate-800 relative overflow-hidden mb-6 shadow-2xl">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <PlaneIcon className="w-32 h-32 text-white" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                        <PlaneIcon className="w-6 h-6 text-primary" /> {t('partnerGateway.requestDetails.title')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-8 text-sm relative z-10">
                                        <div>
                                            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t('partnerGateway.requestDetails.budget')}</span>
                                            <p className="text-lg font-bold text-white">{selectedRequest.from} → {selectedRequest.to}</p>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t('partnerGateway.requestDetails.budget')}</span>
                                            <p className="text-lg font-black text-primary">{selectedRequest.budget.toLocaleString()} {t('global.sar')}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('partnerGateway.requestDetails.vision')}</span>
                                            <p className="text-slate-300 leading-relaxed italic text-sm bg-slate-950/60 p-4 rounded-2xl border border-slate-800">"{selectedRequest.tripDescription || t('partnerGateway.requestDetails.noDescription')}"</p>
                                        </div>
                                    </div>
                                </Card>
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                                    <OfferForm onSubmit={(off) => handleUpdateOffer(selectedRequest.id, off)} partnerName={currentPartner.name} initialData={currentPartnerOffer} />
                                </div>
                            </>
                          )}
                      </div>
                  ) : (
                      <Card className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 bg-slate-900/20 rounded-[3rem]">
                          <BotIcon className="w-16 h-16 text-slate-800 mb-6" />
                          <p className="text-slate-600 font-black text-lg tracking-tight">{t('admin.selectTask')}</p>
                      </Card>
                  )}
              </div>
          </div>
      )}

      {view === 'submitted' && (
          <div className="space-y-4 animate-fade-in-up">
              {allPartnerOffers.map(offer => (
                  <Card key={offer.id} className="p-6 flex flex-col sm:flex-row justify-between gap-6 border-slate-800 hover:border-slate-700 transition-all group">
                      <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                              <p className="font-black text-white text-xl group-hover:text-primary transition-colors">{offer.requestTitle}</p>
                              <Tag color={offer.status === 'NeedsRevision' ? 'red' : 'blue'}>{t(`partnerGateway.offerStatus.${offer.status}`)}</Tag>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <p className="text-sm text-slate-400">{t('global.price')}: <span className="text-primary font-black text-lg">{offer.price.toLocaleString()} {t('global.sar')}</span></p>
                            <span className="text-[10px] font-mono text-slate-600 uppercase">#{offer.requestId.split('-')[1].substring(0,6)}</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <Button variant="secondary" onClick={() => setActiveChatRequestId(offer.requestId)} className="!bg-slate-800 !border-slate-700 !text-xs">{t('admin.partnerChat')}</Button>
                      </div>
                  </Card>
              ))}
          </div>
      )}

      {view === 'featured' && (
        <div className="animate-fade-in-up">
           <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-white">{t('partnerGateway.tabs.featured', {count: ''}).split('(')[0]}</h3>
            <Button onClick={handleOpenCreateForm}>
              {t('partnerGateway.featuredOffers.createNew')}
            </Button>
          </div>
          {partnerFeaturedOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerFeaturedOffers.map(offer => (
                <Card key={offer.id} className="p-0 flex flex-col border-slate-800">
                  <img src={offer.imageUrl} alt={offer.title} className="h-48 w-full object-cover rounded-t-[var(--radius-card)]" />
                  <div className="p-5 flex flex-col flex-grow">
                      <h4 className="font-bold text-lg text-white flex-grow">{offer.title}</h4>
                      <p className="text-2xl font-black text-primary mt-2">{offer.price.toLocaleString()} {t('global.sar')}</p>
                  </div>
                   <div className="p-5 border-t border-slate-800 flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEditForm(offer)} className="p-2 text-slate-500 hover:text-blue-400" aria-label={`${t('global.edit')} ${offer.title}`}>
                            <PencilSquareIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleDeleteFeaturedOffer(offer.id)} className="p-2 text-slate-500 hover:text-red-400" aria-label={`${t('global.delete')} ${offer.title}`}>
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <ArchiveBoxIcon className="mx-auto h-16 w-16 text-slate-700" />
              <p className="mt-4 text-slate-500 font-bold">{t('partnerGateway.featuredOffers.noOffers')}</p>
            </div>
          )}
        </div>
      )}

      {view === 'financials' && <PartnerFinancials partnerId={partnerId!} partnerName={currentPartner.name} />}
      <ChatModal isOpen={!!activeChatRequestId} onClose={() => setActiveChatRequestId(null)} title={t('admin.partnerChat')} messages={activeChatRequest?.partnerChatHistory || []} onSendMessage={handleSendMessage} currentUser={currentPartner.name} />
      
      <FeaturedOfferFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveFeaturedOffer}
        offer={editingFeaturedOffer}
      />

      <Modal isOpen={showAgreementModal} onClose={() => setShowAgreementModal(false)} title={t('legal.partner.title')}>
        <div className="space-y-6 text-sm text-slate-300">
            <p className="italic text-slate-400">{t('legal.partner.intro')}</p>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pe-2">
                {getArticles().map((article: any) => (
                    <div key={article.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-2">{article.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{article.desc}</p>
                    </div>
                ))}
            </div>
            <div className="text-right text-[10px] text-slate-500 pt-4 border-t border-slate-800 font-mono">
                {t('partnerList.agreementVersion')}: {currentPartner.agreementVersion} • {new Date(currentPartner.agreementSignedAt!).toLocaleDateString(t('global.locale'))}
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnerGateway;
