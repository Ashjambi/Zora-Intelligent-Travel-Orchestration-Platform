
import React, { useState } from 'react';
import { Client } from '../../types';
import Card from '../shared/Card';
import { PencilSquareIcon, TrashIcon, CalendarIcon, ArchiveBoxIcon, RialSignIcon, SparklesIcon, ClipboardDocumentListIcon, PlusCircleIcon } from '../icons/Icons';
import { useAppContext } from '../../context/AppContext';
import Tag from '../shared/Tag';
import Button from '../shared/Button';
import { useTranslation } from '../../context/LanguageContext';
import Modal from '../shared/Modal';

interface ClientListProps {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onAnalyze: (client: Client) => void;
  onAdd: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ onEdit, onDelete, onAnalyze, onAdd }) => {
  const { clients, requests } = useAppContext();
  const { t } = useTranslation();
  const [selectedClientAgreement, setSelectedClientAgreement] = useState<Client | null>(null);

  const getClientStats = (clientId: string) => {
    const clientRequests = requests.filter(r => r.clientId === clientId);
    const totalRequests = clientRequests.length;
    const totalSpent = clientRequests
      .filter(r => r.status === 'confirmed' || r.status === 'completed' || r.status === 'payment_released')
      .reduce((sum, r) => sum + (r.finalOffer?.price || 0), 0);
    return { totalRequests, totalSpent };
  };
  
  const tierColors: { [key in Client['loyaltyTier']]: 'yellow' | 'blue' | 'green' } = {
      'Bronze': 'yellow',
      'Silver': 'blue',
      'Gold': 'green',
  };

  // Helper to safely get articles array
  const getArticles = () => {
      const articles = t('legal.client.articles', { returnObjects: true });
      return Array.isArray(articles) ? articles : [];
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-white">{t('clientList.title', { count: clients.length })}</h3>
            <Button onClick={onAdd} className="!py-3 !px-6 shadow-xl shadow-primary/20">
                {t('clientList.add')}
            </Button>
        </div>

        {clients.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[2rem] bg-slate-900/20">
                <ArchiveBoxIcon className="mx-auto h-16 w-16 text-slate-700 mb-4" />
                <p className="text-slate-500 font-bold">{t('clientList.noClients')}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clients.map((client) => {
                    const { totalRequests, totalSpent } = getClientStats(client.id);
                    return (
                        <Card key={client.id} className="p-5 flex flex-col border-slate-800">
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg text-white">{client.name}</h4>
                                        <p className="text-sm text-slate-500">{client.email}</p>
                                    </div>
                                    <Tag color={tierColors[client.loyaltyTier]}>
                                        {t(`enums.loyaltyTier.${client.loyaltyTier}`)}
                                    </Tag>
                                </div>
                                
                                <div className="my-4 pt-4 border-t border-slate-800 text-sm space-y-2 text-slate-400">
                                <p><strong className="font-medium text-slate-500 w-28 inline-block">{t('clientList.phone')}</strong> {client.phone || 'N/A'}</p>
                                <p><strong className="font-medium text-slate-500 w-28 inline-block">{t('clientList.preferredDestinations')}</strong> {client.preferredDestinations || 'N/A'}</p>
                                <div className="flex items-center text-slate-500 mt-4">
                                    <CalendarIcon className="w-4 h-4 mx-2 text-slate-600"/>
                                    <span>{t('clientList.joinedOn', {date: client.joinDate})}</span>
                                    </div>
                                    <div className="mt-4">
                                        {client.agreementSignedAt ? (
                                            <button 
                                                onClick={() => setSelectedClientAgreement(client)}
                                                className="flex items-center gap-1.5 text-[10px] font-black text-green-400 uppercase tracking-widest hover:text-green-300 transition-colors"
                                            >
                                                <ClipboardDocumentListIcon className="w-4 h-4" />
                                                {t('clientList.agreementSigned')}
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{t('clientList.agreementPending')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <div className="flex justify-around text-center mb-4">
                                    <div>
                                        <p className="text-xs text-slate-500">{t('clientList.totalRequests')}</p>
                                        <p className="text-xl font-bold text-blue-400">{totalRequests}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">{t('clientList.totalSpent')}</p>
                                        <p className="text-xl font-bold text-green-400 flex items-center justify-center">
                                            <RialSignIcon className="w-4 h-4" />
                                            <span>{totalSpent.toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end space-x-1 rtl:space-x-reverse">
                                    <Button onClick={() => onAnalyze(client)} variant="secondary" className="!py-2 !px-3 !text-sm flex-grow !bg-slate-800 !border-slate-700">
                                        {t('clientList.analyzeActivity')}
                                    </Button>
                                    <button onClick={() => onEdit(client)} className="p-2 text-slate-500 hover:text-blue-400">
                                        <PencilSquareIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={() => onDelete(client)} className="p-2 text-slate-500 hover:text-red-400">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        )}

        <Modal 
            isOpen={!!selectedClientAgreement} 
            onClose={() => setSelectedClientAgreement(null)} 
            title={t('clientList.agreementArchiveTitle')}
            size="lg"
        >
            {selectedClientAgreement && (
                <div className="space-y-6">
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <ClipboardDocumentListIcon className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-black text-white">{selectedClientAgreement.name}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('clientList.agreementVersion')}: {selectedClientAgreement.agreementVersion}</p>
                                </div>
                            </div>
                            <Tag color="green">{t('clientList.agreementActive')}</Tag>
                        </div>
                        <div className="flex justify-between border-t border-slate-900 pt-3 text-xs">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-right">{t('clientList.agreementDate')}</span>
                            <span className="text-slate-200 font-mono">{new Date(selectedClientAgreement.agreementSignedAt!).toLocaleDateString(t('global.locale'))}</span>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-black text-sm text-slate-400 mb-3 uppercase tracking-widest">{t('legal.client.title')}</h4>
                        <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/60 max-h-64 overflow-y-auto custom-scrollbar space-y-4 text-xs text-slate-400">
                            {getArticles().map((article: any) => (
                                <div key={article.id}>
                                    <p className="font-bold text-slate-300">{article.title}</p>
                                    <p>{article.desc}</p>
                                </div>
                            ))}
                            {getArticles().length === 0 && <p className="text-center italic">{t('global.loading')}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => setSelectedClientAgreement(null)} variant="secondary">{t('clientList.closeArchive')}</Button>
                    </div>
                </div>
            )}
        </Modal>
    </div>
  );
};

export default ClientList;
