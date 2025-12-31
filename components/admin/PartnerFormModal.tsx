
import React, { useState, useEffect } from 'react';
import { Partner } from '../../types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useTranslation } from '../../context/LanguageContext';

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: Omit<Partner, 'id'> | Partner) => void;
  partner: Partner | null;
}

// Re-usable section component for better structure
const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4 pt-5 border-t border-slate-800 first:border-t-0 first:pt-0">
        <h3 className="text-sm font-black text-primary uppercase tracking-widest">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({ isOpen, onClose, onSave, partner }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    rating: 4.0,
    specialty: '',
    contactEmail: '',
    status: 'Active' as 'Active' | 'Inactive',
    contactPerson: '',
    phone: '',
    address: '',
    notes: '',
    performanceTier: 'Standard' as Partner['performanceTier'],
    bio: '',
    galleryImageUrls: '',
    websiteUrl: ''
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        rating: partner.rating,
        specialty: partner.specialty,
        contactEmail: partner.contactEmail,
        status: partner.status,
        contactPerson: partner.contactPerson || '',
        phone: partner.phone || '',
        address: partner.address || '',
        notes: partner.notes || '',
        performanceTier: partner.performanceTier,
        bio: partner.bio || '',
        galleryImageUrls: partner.galleryImageUrls?.join(', ') || '',
        websiteUrl: partner.websiteUrl || ''
      });
    } else {
      setFormData({
        name: '',
        rating: 4.0,
        specialty: '',
        contactEmail: '',
        status: 'Active',
        contactPerson: '',
        phone: '',
        address: '',
        notes: '',
        performanceTier: 'Standard',
        bio: '',
        galleryImageUrls: '',
        websiteUrl: ''
      });
    }
  }, [partner, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      galleryImageUrls: formData.galleryImageUrls.split(',').map(url => url.trim()).filter(Boolean)
    };

    if (partner) {
      onSave({ ...partner, ...processedData });
    } else {
      const newPartnerData = {
          ...processedData,
          joinDate: new Date().toISOString().split('T')[0],
      };
      onSave(newPartnerData as Omit<Partner, 'id'>);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={partner ? t('partnerForm.editTitle') : t('partnerForm.addTitle')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <FormSection title={t('partnerForm.basicInfo')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.partnerName')}</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="form-input mt-1 w-full"/>
                </div>
                <div>
                  <label htmlFor="contactPerson" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.contactPerson')}</label>
                  <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} onChange={handleChange} className="form-input mt-1 w-full" />
                </div>
                 <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.phone')}</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="form-input mt-1 w-full" />
                </div>
                 <div>
                    <label htmlFor="contactEmail" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.email')}</label>
                    <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={handleChange} required className="form-input mt-1 w-full" />
                </div>
            </div>
        </FormSection>

        <FormSection title={t('partnerForm.marketingProfile')}>
             <div>
                <label htmlFor="bio" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.bio')}</label>
                <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} rows={3} className="form-input mt-1 w-full" placeholder={t('partnerForm.bioPlaceholder')}></textarea>
            </div>
            <div>
                <label htmlFor="websiteUrl" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.website')}</label>
                <input type="url" name="websiteUrl" id="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="form-input mt-1 w-full" placeholder={t('partnerForm.websitePlaceholder')} />
            </div>
            <div>
                <label htmlFor="galleryImageUrls" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.galleryUrls')}</label>
                <textarea name="galleryImageUrls" id="galleryImageUrls" value={formData.galleryImageUrls} onChange={handleChange} rows={2} className="form-input mt-1 w-full" placeholder={t('partnerForm.galleryUrlsPlaceholder')}></textarea>
            </div>
        </FormSection>
        
        <FormSection title={t('partnerForm.operationalClassification')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="specialty" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.specialty')}</label>
                  <input type="text" name="specialty" id="specialty" value={formData.specialty} onChange={handleChange} required className="form-input mt-1 w-full" />
                </div>
                <div>
                  <label htmlFor="rating" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.rating')}</label>
                  <input type="number" name="rating" id="rating" value={formData.rating} onChange={handleChange} required step="0.1" min="0" max="5" className="form-input mt-1 w-full" />
                </div>
                 <div>
                    <label htmlFor="status" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.status')}</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="form-input mt-1 w-full">
                        <option value="Active">{t('enums.partnerStatus.Active')}</option>
                        <option value="Inactive">{t('enums.partnerStatus.Inactive')}</option>
                    </select>
                 </div>
                 <div>
                    <label htmlFor="performanceTier" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.performanceTier')}</label>
                    <select name="performanceTier" id="performanceTier" value={formData.performanceTier} onChange={handleChange} className="form-input mt-1 w-full">
                        <option value="Standard">{t('enums.performanceTier.Standard')}</option>
                        <option value="Preferred">{t('enums.performanceTier.Preferred')}</option>
                        <option value="Elite">{t('enums.performanceTier.Elite')}</option>
                    </select>
                 </div>
            </div>
        </FormSection>
        
        <div>
            <label htmlFor="notes" className="block text-xs font-medium text-slate-400 mb-1">{t('partnerForm.adminNotes')}</label>
            <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={2} className="form-input mt-1 w-full"></textarea>
        </div>

        <div className="pt-4 flex justify-end space-x-3 rtl:space-x-reverse border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>{t('global.cancel')}</Button>
          <Button type="submit">{partner ? t('global.save') : t('partnerForm.addPartner')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PartnerFormModal;
