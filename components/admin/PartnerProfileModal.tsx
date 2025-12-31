
import React from 'react';
import { Partner } from '../../types';
import Modal from '../shared/Modal';
import { StarIcon, BuildingOfficeIcon, GlobeAltIcon } from '../icons/Icons';
import Tag from '../shared/Tag';
import { useTranslation } from '../../context/LanguageContext';

interface PartnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
}

const PartnerProfileModal: React.FC<PartnerProfileModalProps> = ({ isOpen, onClose, partner }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const tierColors: { [key in Partner['performanceTier']]: 'green' | 'blue' | 'yellow' } = {
      'Elite': 'green',
      'Preferred': 'blue',
      'Standard': 'yellow',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('partnerProfile.modalTitle', { name: partner.name })}>
      <div className="space-y-6">
        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-700">
                    <BuildingOfficeIcon className="w-12 h-12 text-primary"/>
                </div>
                <div className="flex-grow text-center sm:text-right">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <h3 className="text-2xl font-black text-white">{partner.name}</h3>
                        <div className="flex items-center gap-1.5 text-yellow-400 font-bold mt-2 sm:mt-0 justify-center">
                            <StarIcon className="w-5 h-5"/>
                            <span>{partner.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{partner.specialty}</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                        <Tag color={tierColors[partner.performanceTier]}>{partner.performanceTier}</Tag>
                        <Tag color={partner.status === 'Active' ? 'green' : 'red'}>{partner.status}</Tag>
                    </div>
                </div>
            </div>
            {partner.websiteUrl && (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center sm:justify-start gap-2 text-sm text-primary hover:underline">
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>{t('partnerProfile.visitWebsite')}</span>
                </a>
            )}
        </div>

        {partner.bio && (
            <div>
                <h4 className="font-black text-sm text-slate-400 mb-3 uppercase tracking-widest">{t('partnerProfile.bioTitle')}</h4>
                <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/60">
                    <p className="text-slate-300 leading-relaxed text-sm">{partner.bio}</p>
                </div>
            </div>
        )}

        {partner.galleryImageUrls && partner.galleryImageUrls.length > 0 && (
            <div>
                <h4 className="font-black text-sm text-slate-400 mb-3 uppercase tracking-widest">{t('partnerProfile.galleryTitle')}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {partner.galleryImageUrls.map((url, index) => (
                        <div key={index} className="aspect-w-1 aspect-h-1 rounded-xl overflow-hidden border border-slate-700">
                            <img src={url} alt={`Gallery image ${index + 1} for ${partner.name}`} className="w-full h-full object-cover"/>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default PartnerProfileModal;
