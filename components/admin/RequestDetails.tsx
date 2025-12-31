
import React, { useState } from 'react';
import { TravelRequest, PresentedOffer, PartnerOffer } from '../../types';
import { getAITopOfferSelection } from '../../services/geminiService';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Chat from '../shared/Chat';
import { BotIcon, CheckCircleIcon, StarIcon, ChartBarIcon, ChatBubbleIcon, PlusCircleIcon, RialSignIcon, SendIcon, SparklesIcon, CheckBadgeIcon, PencilSquareIcon, ExclamationTriangleIcon, XCircleIcon, BuildingOfficeIcon, ClockIcon, InfoIcon } from '../icons/Icons';
import Tag from '../shared/Tag';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import Modal from '../shared/Modal';

interface RequestDetailsProps {
  request: TravelRequest;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request }) => {
  const { partners, presentOffersToClient, sendRequestToPartners, updateRequestStatus, addChatMessage, releasePartnerPayment, completeTrip, platformCommissionRate, requestPartnerRevision, cancelPartnerRevision } = useAppContext();
  const { t, language } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  const originatingPartner = request.originatingPartnerId ? partners.find(p => p.id === request.originatingPartnerId) : null;

  const handleAIAnalysis = async () => {
    const validOffers = request.offers.filter(o => !o.isRejected);
    if (validOffers.length === 0) {
        alert(t('requestDetails.noValidOffers'));
        return;
    }
    updateRequestStatus(request.id, 'analyzing');
    setIsLoading(true);
    try {
        // Fix: Removed the extra language argument as getAITopOfferSelection only accepts request and offers
        const result = await getAITopOfferSelection(request, validOffers);
        if (result && result.length > 0) {
          presentOffersToClient(request.id, result);
        } else {
          updateRequestStatus(request.id, 'pending_bids');
        }
    } catch (error) {
        updateRequestStatus(request.id, 'pending_bids');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendToPartners = () => sendRequestToPartners(request.id);
  
  const handleAdminSendMessage = (chatType: 'client' | 'partner') => (text: string) => {
    addChatMessage(request.id, chatType, {
        sender: 'Admin',
        text,
        timestamp: new Date().toLocaleTimeString(t('global.locale'), { hour: '2-digit', minute: '2-digit' })
    });
  };

  const validOffers = request.offers.filter(o => !o.isRejected);
  const canRunAIAnalysis = request.status === 'pending_bids' && validOffers.length > 0;
  const isRejectedByClient = request.status === 'revision_requested';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="p-6 sm:p-8 relative overflow-hidden border-slate-800">
        <div className="flex justify-between items-start mb-8">
           <div>
               <h3 className="text-2xl font-black text-white flex items-baseline gap-4">
                   <span>{request.from} → {request.to}</span>
                   <span className="text-lg font-mono text-slate-500">#{request.id.split('-')[1].substring(0,6)}</span>
               </h3>
               {request.originatingPartnerId && 
                   <div className="mt-2">
                       <Tag color="purple">{t('partnerGateway.tasks.exclusiveRequest')}</Tag>
                   </div>
               }
           </div>
           <Tag color={request.status === 'completed' ? 'green' : (isRejectedByClient ? 'red' : 'blue')}>
               {t(`enums.requestStatus.${request.status}`)}
           </Tag>
        </div>
        
        {isRejectedByClient && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-3xl">
                <div className="flex items-start gap-4 mb-5">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-black text-white text-lg">{t('requestDetails.reroutingTitle')}</h4>
                        <p className="text-sm text-red-400 mt-1 leading-relaxed">
                            {request.rejectionReason ? `${t('requestDetails.rejectionReasonText')}: "${request.rejectionReason}"` : t('requestDetails.rejectionReasonDefault')}
                        </p>
                    </div>
                </div>
                <Button onClick={handleSendToPartners} className="w-full !bg-red-600 shadow-xl shadow-red-600/20">
                    {t('requestDetails.rerouteButton')}
                </Button>
            </div>
        )}

        {request.status === 'new_request' && (
            <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <InfoIcon className="w-6 h-6 text-blue-400" />
                    <p className="text-sm font-bold text-slate-200">{t('requestDetails.newRequestInfo')}</p>
                </div>
                <Button onClick={handleSendToPartners} className="w-full sm:w-auto shadow-lg shadow-primary/20">
                    {t('requestDetails.sendToPartnersButton')}
                </Button>
            </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div><span className="block text-slate-500 mb-1.5 font-black text-[10px] uppercase tracking-wider">{t('requestDetails.travelers')}</span><span className="font-bold text-white text-base">{request.travelers}</span></div>
          <div><span className="block text-slate-500 mb-1.5 font-black text-[10px] uppercase tracking-wider">{t('requestDetails.departure')}</span><span className="font-bold text-white text-base">{request.departureDate}</span></div>
          <div><span className="block text-slate-500 mb-1.5 font-black text-[10px] uppercase tracking-wider">{t('requestDetails.comfort')}</span><span className="font-bold text-white text-base">{t(`enums.comfortLevel.${request.comfortLevel}`)}</span></div>
          <div><span className="block text-slate-500 mb-1.5 font-black text-[10px] uppercase tracking-wider">{t('requestDetails.budget')}</span><span className="font-black text-primary text-base">{request.budget.toLocaleString()} {t('global.sar')}</span></div>
        </div>
      </Card>
      
      {(request.status === 'pending_bids' || request.status === 'analyzing') && (
        <Card className="p-6 sm:p-8">
            <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                <BuildingOfficeIcon className="w-6 h-6 text-primary" />
                <span>{t('requestDetails.receivedOffers')} ({validOffers.length})</span>
            </h3>
            {validOffers.length > 0 ? (
                <div className="space-y-4">
                    {validOffers.map(offer => (
                        <div key={offer.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-xs text-slate-400">
                                    <StarIcon className="w-4 h-4 text-yellow-400 me-1" /> {offer.partnerRating}
                                </div>
                                <p className="font-bold text-white group-hover:text-primary transition-colors">{offer.partnerName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-primary">{offer.price.toLocaleString()} {t('global.sar')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 text-center py-8">{t('requestDetails.noOffersYet')}</p>
            )}

            {canRunAIAnalysis && (
                <div className="mt-8 pt-8 border-t border-slate-800 bg-slate-950 p-6 -m-6 sm:-m-8 -mb-8 sm:-mb-8 rounded-b-[var(--radius-card)]">
                    <div className="flex flex-col items-center text-center gap-4">
                        <SparklesIcon className="w-10 h-10 text-primary" />
                        <div>
                            <h4 className="font-black text-white text-lg">{t('requestDetails.analyzeOffersTitle')}</h4>
                            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                                {t('requestDetails.analyzeOffersSubtitle', { count: validOffers.length })}
                            </p>
                        </div>
                        <Button onClick={handleAIAnalysis} loading={isLoading || request.status === 'analyzing'} className="mt-2 w-full sm:w-auto px-10 !py-3 !bg-primary shadow-2xl shadow-primary/30">
                            {t('requestDetails.runAIButton')}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
      )}

      {(request.status === 'confirmed' || request.status === 'payment_released' || request.status === 'completed') && request.finalOffer && (() => {
          const totalPaid = request.finalPriceAtPayment ?? 0;
          const commission = request.commissionAtPayment ?? 0;
          const amountDue = request.payoutAmountAtPayment ?? 0;

          return (
              <Card className="p-6">
                  <h3 className="text-lg font-black mb-6">{t('requestDetails.accounting')}</h3>
                  <div className="space-y-4 font-mono text-lg bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-sans font-medium text-slate-400">{t('requestDetails.totalPaidByClient')}</span>
                            <span className="font-black text-green-400">+ {totalPaid.toLocaleString(language)} {t('global.sar')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-sans font-medium text-slate-400">{t('requestDetails.platformCommission', { rate: (platformCommissionRate * 100).toFixed(0) })}</span>
                            <span className="font-black text-primary">- {commission.toLocaleString(language)} {t('global.sar')}</span>
                        </div>
                        <div className="border-t border-dashed border-slate-700 my-4"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-sans font-bold text-slate-200">{t('requestDetails.amountDueToPartner', { partnerName: request.finalOffer.partnerName })}</span>
                            <span className="font-black text-blue-400 text-2xl">= {amountDue.toLocaleString(language)} {t('global.sar')}</span>
                        </div>
                    </div>

                  {request.status === 'confirmed' && (
                      <div className="mt-6">
                          <Button onClick={() => releasePartnerPayment(request.id)} className="w-full">
                              {t('requestDetails.releasePayment')}
                          </Button>
                      </div>
                  )}
                  {request.status === 'payment_released' && (
                       <div className="mt-6 p-4 bg-green-500/10 text-center rounded-lg border border-green-500/20 text-sm text-green-400 font-bold">
                          {t('requestDetails.paymentReleased')}
                       </div>
                  )}
              </Card>
          );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chat title={t('admin.clientChat')} messages={request.chatHistory || []} onSendMessage={handleAdminSendMessage('client')} currentUser="Admin" />
          <Chat title={t('admin.partnerChat')} messages={request.partnerChatHistory || []} onSendMessage={handleAdminSendMessage('partner')} currentUser="Admin" />
      </div>
    </div>
  );
};

export default RequestDetails;
