
import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useTranslation } from '../../context/LanguageContext';
import { UserGroupIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, SparklesIcon } from '../icons/Icons';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'> | Client) => void;
  client: Client | null;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, client }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDestinations: '',
    travelPreferences: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        preferredDestinations: client.preferredDestinations || '',
        travelPreferences: client.travelPreferences || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        preferredDestinations: '',
        travelPreferences: '',
      });
    }
  }, [client, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
        ...formData,
        joinDate: client ? client.joinDate : new Date().toISOString().split('T')[0],
        loyaltyTier: client ? client.loyaltyTier : 'Bronze',
    };

    if (client) {
      onSave({ ...client, ...dataToSave });
    } else {
      onSave(dataToSave as Omit<Client, 'id'>);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? t('clientForm.editTitle') : t('clientForm.addTitle')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Personal Information */}
        <div className="space-y-5">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-white/5 pb-2">
                {t('clientForm.sectionPersonal')}
            </h4>
            
            <div>
              <label htmlFor="client-name" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t('clientForm.clientName')}</label>
              <div className="relative">
                  <input
                    type="text" name="name" id="client-name" value={formData.name} onChange={handleChange} required
                    className="form-input w-full ps-12 py-3 bg-slate-900/50 border-slate-700 focus:border-primary text-white font-bold"
                    placeholder={t('clientForm.namePlaceholder')}
                  />
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 rtl:ps-0 rtl:pr-4 flex items-center pointer-events-none">
                    <UserGroupIcon className="h-5 w-5 text-slate-500" />
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="client-email" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t('clientForm.email')}</label>
                  <div className="relative">
                      <input
                        type="email" name="email" id="client-email" value={formData.email} onChange={handleChange} required
                        className="form-input w-full ps-12 py-3 bg-slate-900/50 border-slate-700 focus:border-primary text-white"
                        placeholder="example@domain.com"
                      />
                      <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 rtl:ps-0 rtl:pr-4 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-slate-500" />
                      </div>
                  </div>
                </div>
                 <div>
                  <label htmlFor="client-phone" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t('clientForm.phone')}</label>
                  <div className="relative">
                      <input
                        type="tel" name="phone" id="client-phone" value={formData.phone} onChange={handleChange}
                        className="form-input w-full ps-12 py-3 bg-slate-900/50 border-slate-700 focus:border-primary text-white font-mono"
                        placeholder="05xxxxxxxx"
                      />
                      <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 rtl:ps-0 rtl:pr-4 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-slate-500" />
                      </div>
                  </div>
                </div>
            </div>
        </div>

        {/* Section 2: Travel Profile */}
        <div className="space-y-5">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-white/5 pb-2">
                {t('clientForm.sectionTravel')}
            </h4>

             <div>
              <label htmlFor="client-destinations" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t('clientForm.preferredDestinations')}</label>
              <div className="relative">
                  <input
                    type="text" name="preferredDestinations" id="client-destinations" value={formData.preferredDestinations} onChange={handleChange}
                    placeholder={t('clientForm.preferredDestinationsPlaceholder')}
                    className="form-input w-full ps-12 py-3 bg-slate-900/50 border-slate-700 focus:border-primary text-white"
                  />
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 rtl:ps-0 rtl:pr-4 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-slate-500" />
                  </div>
              </div>
            </div>

            <div>
                <label htmlFor="client-preferences" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t('clientForm.travelPreferences')}</label>
                <div className="relative">
                    <textarea
                        name="travelPreferences" id="client-preferences" value={formData.travelPreferences} onChange={handleChange}
                        rows={4}
                        placeholder={t('clientForm.travelPreferencesPlaceholder')}
                        className="form-input w-full ps-12 py-3 bg-slate-900/50 border-slate-700 focus:border-primary text-white leading-relaxed"
                    ></textarea>
                    <div className="absolute top-3 left-0 rtl:left-auto rtl:right-0 ps-4 rtl:ps-0 rtl:pr-4 flex items-start pointer-events-none">
                        <SparklesIcon className="h-5 w-5 text-slate-500" />
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-6 flex justify-end space-x-4 rtl:space-x-reverse border-t border-slate-800 mt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="!px-6 !py-3">{t('global.cancel')}</Button>
          <Button type="submit" className="!px-8 !py-3 shadow-xl">{client ? t('global.save') : t('clientForm.addClient')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientFormModal;
