
import React, { useState } from 'react';
import { Partner } from '../../types';
import Card from '../shared/Card';
import Tag from '../shared/Tag';
import { StarIcon, PencilSquareIcon, TrashIcon, SparklesIcon, ClipboardDocumentListIcon, ClockIcon, PlusCircleIcon, UserGroupIcon } from '../icons/Icons';
import { useAppContext } from '../../context/AppContext';
import Button from '../shared/Button';
import { useTranslation } from '../../context/LanguageContext';
import Modal from '../shared/Modal';

interface PartnerListProps {
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
  onAnalyze: (partner: Partner) => void;
  onAdd: () => void;
  onViewProfile: (partner: Partner) => void;
}

const PartnerList: React.FC<PartnerListProps> = ({ onEdit, onDelete, onAnalyze, onAdd, onViewProfile }) => {
  const { partners } = useAppContext();
  const { t } = useTranslation();
  const [selectedPartnerAgreement, setSelectedPartnerAgreement] = useState<Partner | null>(null);

  const tierColors: { [key in Partner['performanceTier']]: 'green' | 'blue' | 'yellow' } = {
      'Elite': 'green',
      'Preferred': 'blue',
      'Standard': 'yellow',
  };

  // Helper to safely get articles array
  const getArticles = () => {
      const articles = t('legal.partner.articles', { returnObjects: true });
      return Array.isArray(articles) ? articles : [];
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-white">{t('partnerList.title', { count: partners.length })}</h3>
            <Button onClick={onAdd} className="!py-3 !px-6 shadow-xl shadow-primary/20">
                {t('partnerList.add')}
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {partners.map((partner) => (
            <Card key={partner.id} className="p-5 flex flex-col justify-between border-slate-800">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <h4 className="font-bold text-lg text-white">{partner.name}</h4>
                            <Tag color={partner.status === 'Active' ? 'green' : 'yellow'}>
                            {t(`enums.partnerStatus.${partner.status}`)}
                            </Tag>
                        </div>
                        <p className="text-sm text-slate-500">{partner.specialty}</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <StarIcon className="w-5 h-5 text-yellow-400 mx-1" />
                        <span className="font-bold text-slate-300">{partner.rating.toFixed(1)}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-sm text-slate-400">
                    <p><strong className="font-medium text-slate-500 w-24 inline-block">{t('partnerList.contact')}</strong> {partner.contactPerson || 'N/A'}</p>
                    <p><strong className="font-medium text-slate-500 w-24 inline-block">{t('partnerList.email')}</strong> {partner.contactEmail}</p>
                    <p><strong className="font-medium text-slate-500 w-24 inline-block">{t('partnerList.phone')}</strong> {partner.phone || 'N/A'}</p>
                    <p><strong className="font-medium text-slate-500 w-24 inline-block">{t('partnerList.joinDate')}</strong> {partner.joinDate}</p>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                    <Tag color={tierColors[partner.performanceTier]}>{t('partnerList.performanceTier')} {t(`enums.performanceTier.${partner.performanceTier}`)}</Tag>
                    
                    {partner.agreementSignedAt ? (
                        <button 
                            onClick={() => setSelectedPartnerAgreement(partner)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-green-400 uppercase tracking-widest hover:text-green-300 transition-colors"
                        >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                            {t('partnerList.agreementSigned')}
                        </button>
                    ) : (
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{t('partnerList.agreementPending')}</span>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end space-x-2 rtl:space-x-reverse">
                <Button onClick={() => onViewProfile(partner)} variant="secondary" className="!py-2 !px-3 !text-sm flex-grow !bg-primary/10 !border-primary/20 !text-primary">
                    {t('partnerList.viewProfile')}
                </Button>
                <button onClick={() => onEdit(partner)} className="p-2 text-slate-500 hover:text-blue-400" aria-label={`${t('global.edit')} ${partner.name}`}>
                    <PencilSquareIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(partner)} className="p-2 text-slate-500 hover:text-red-400" aria-label={`${t('global.delete')} ${partner.name}`}>
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
            </Card>
        ))}
        </div>

      <Modal 
        isOpen={!!selectedPartnerAgreement} 
        onClose={() => setSelectedPartnerAgreement(null)} 
        title={t('partnerList.agreementArchiveTitle')}
        size="lg"
      >
        {selectedPartnerAgreement && (
            <div className="space-y-6">
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <ClipboardDocumentListIcon className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-black text-white">{selectedPartnerAgreement.name}</h4>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('partnerList.agreementVersion')}: {selectedPartnerAgreement.agreementVersion}</p>
                            </div>
                        </div>
                        <Tag color="green">{t('partnerList.agreementActive')}</Tag>
                    </div>
                     <div className="flex justify-between border-t border-slate-900 pt-3 text-xs">
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-right">{t('partnerList.agreementDate')}</span>
                        <span className="text-slate-200 font-mono">{new Date(selectedPartnerAgreement.agreementSignedAt!).toLocaleDateString(t('global.locale'))}</span>
                    </div>
                </div>

                <div>
                    <h4 className="font-black text-sm text-slate-400 mb-3 uppercase tracking-widest">{t('legal.partner.title')}</h4>
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
                    <Button onClick={() => setSelectedPartnerAgreement(null)} variant="secondary">{t('partnerList.closeArchive')}</Button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default PartnerList;
