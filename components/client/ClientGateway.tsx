
import React, { useState, useMemo } from 'react';
import RequestForm from './RequestForm';
import RequestStatus from './RequestStatus';
import * as Icons from '../icons/Icons';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import Card from '../shared/Card';
import Modal from '../shared/Modal';

interface ClientGatewayProps {
    activeClientId: string | null;
    onAuthRequired?: () => void;
    onAuthSuccess: (clientId: string) => void;
}

const ClientGateway: React.FC<ClientGatewayProps> = ({ activeClientId, onAuthRequired, onAuthSuccess }) => {
  const { requests, clients } = useAppContext();
  const { t } = useTranslation();
  const [view, setView] = useState<'new_request' | 'my_requests'>('new_request');
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  
  const currentClient = useMemo(() => clients.find(c => c.id === activeClientId), [clients, activeClientId]);
  const myRequests = useMemo(() => requests.filter(r => r.clientId === activeClientId), [requests, activeClientId]);

  const handleViewMyRequests = () => {
      if (!activeClientId) {
          onAuthRequired?.();
      } else {
          setView('my_requests');
      }
  };

  const getArticles = () => {
      const articles = t('legal.client.articles', { returnObjects: true });
      return Array.isArray(articles) ? articles : [];
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[480px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-110"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit&crop')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
          
          <div className="relative z-10 max-w-screen-2xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t('clientGateway.premiumExperience')}</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
                {activeClientId && currentClient ? `${t('clientGateway.welcome')} ${currentClient.name.split(' ')[0]}` : t('clientGateway.guestTitle')}
              </h1>
              
              <p className="text-slate-400 font-bold text-lg max-w-2xl leading-relaxed mb-10">
                {t('clientGateway.subtitle')}
              </p>

              {activeClientId && (
                  <button 
                    onClick={() => setShowAgreementModal(true)} 
                    className="mb-8 flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest border border-slate-700 hover:border-slate-500 rounded-full px-4 py-1.5 bg-slate-900/50 backdrop-blur-md"
                  >
                      <Icons.ClipboardDocumentListIcon className="w-3.5 h-3.5" />
                      {t('global.viewAgreement')}
                  </button>
              )}

              <div className="flex gap-4 p-2 bg-slate-900/60 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl">
                <button
                  onClick={() => setView('new_request')}
                  className={`px-8 py-4 font-black text-sm rounded-2xl transition-all duration-500 ${view === 'new_request' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                >
                  {t('clientGateway.newRequest')}
                </button>
                <button
                  onClick={handleViewMyRequests}
                  className={`px-8 py-4 font-black text-sm rounded-2xl transition-all duration-500 ${view === 'my_requests' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                >
                  {t('clientGateway.myRequests')}
                </button>
              </div>
          </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 py-20 min-h-[600px]">
          {view === 'new_request' ? (
            <RequestForm clientId={activeClientId} onComplete={() => setView('my_requests')} onAuthSuccess={onAuthSuccess} />
          ) : (
            <div className="space-y-6">
              {myRequests.length > 0 ? (
                 myRequests.map(request => <RequestStatus key={request.id} request={request} />)
              ) : (
                <div className="text-center py-32 border-2 border-dashed border-slate-800 rounded-[3rem]">
                    <Icons.ArchiveBoxIcon className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <p className="text-2xl font-black text-slate-700">{t('clientGateway.noRequests')}</p>
                </div>
              )}
            </div>
          )}
      </div>

      <Modal isOpen={showAgreementModal} onClose={() => setShowAgreementModal(false)} title={t('legal.client.title')}>
        <div className="space-y-6 text-sm text-slate-300">
            <p className="italic text-slate-400">{t('legal.client.intro')}</p>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pe-2">
                {getArticles().map((article: any) => (
                    <div key={article.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-2">{article.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{article.desc}</p>
                    </div>
                ))}
            </div>
            <div className="text-right text-[10px] text-slate-500 pt-4 border-t border-slate-800 font-mono">
                {currentClient && (
                    <>{t('clientList.agreementVersion')}: {currentClient.agreementVersion} • {new Date(currentClient.agreementSignedAt!).toLocaleDateString(t('global.locale'))}</>
                )}
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientGateway;
