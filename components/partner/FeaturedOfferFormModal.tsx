
import React, { useState, useEffect, useRef } from 'react';
import { FeaturedOffer, ComfortLevel, TripType } from '../../types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { COMFORT_LEVELS, TRIP_TYPES } from '../../constants';
import { CameraIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface FeaturedOfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Omit<FeaturedOffer, 'id' | 'partnerId' | 'partnerName'> | FeaturedOffer) => void;
  offer: FeaturedOffer | null;
}

const initialFormData = {
  title: '',
  description: '',
  imageUrl: '',
  price: 0,
  tags: '',
  requestDetails: {
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    travelers: 1,
    tripType: TripType.RoundTrip,
    comfortLevel: ComfortLevel.Comfort,
    tripDescription: '',
  },
};

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4 pt-4 border-t border-slate-700 first:border-t-0 first:pt-0">
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        {children}
    </div>
);


const FeaturedOfferFormModal: React.FC<FeaturedOfferFormModalProps> = ({ isOpen, onClose, onSave, offer }) => {
  const [formData, setFormData] = useState<any>(initialFormData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (offer) {
      setFormData({
        ...offer,
        tags: offer.tags.join(', '),
      });
    } else {
      setFormData(initialFormData);
    }
  }, [offer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name in formData.requestDetails) {
        setFormData((prev: any) => ({
            ...prev,
            requestDetails: { ...prev.requestDetails, [name]: value }
        }));
    } else {
        setFormData((prev: any) => ({
            ...prev,
            [name]: name === 'price' || name === 'travelers' ? Number(value) : value
        }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert(t('featuredOfferForm.imageTooLarge'));
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
        alert(t('featuredOfferForm.imageRequired'));
        return;
    }
    const finalData = {
        ...formData,
        tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    };

    if (offer) {
      onSave(finalData as FeaturedOffer);
    } else {
      onSave(finalData as Omit<FeaturedOffer, 'id' | 'partnerId' | 'partnerName'>);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={offer ? t('featuredOfferForm.titleEdit') : t('featuredOfferForm.titleCreate')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title={t('featuredOfferForm.sectionPrimary')}>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-400">{t('featuredOfferForm.offerTitle')}</label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="form-input mt-1"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-400">{t('featuredOfferForm.offerImage')}</label>
                <div className="mt-2 flex items-center space-x-4 rtl:space-x-reverse p-3 bg-slate-950/50 rounded-lg border border-dashed border-slate-700">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt={t('featuredOfferForm.imagePreview')} className="w-20 h-20 object-cover rounded-md shadow-sm"/>
                    ) : (
                        <div className="w-20 h-20 bg-slate-800 rounded-md flex items-center justify-center">
                            <CameraIcon className="w-10 h-10 text-slate-500"/>
                        </div>
                    )}
                    <div className="flex-1">
                        <input
                            type="file"
                            id="imageUrl"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                            className="sr-only"
                            ref={fileInputRef}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            className="!py-2 !px-3 !text-sm"
                        >
                            {formData.imageUrl ? t('featuredOfferForm.changeImage') : t('featuredOfferForm.attachImage')}
                        </Button>
                        <p className="text-xs text-slate-500 mt-2">{t('featuredOfferForm.imageHint')}</p>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-400">{t('featuredOfferForm.offerDescription')}</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={6} className="form-input mt-1 w-full"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-slate-400">{t('featuredOfferForm.price')}</label>
                    <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="form-input mt-1"/>
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-slate-400">{t('featuredOfferForm.tags')}</label>
                    <input type="text" name="tags" id="tags" value={formData.tags} placeholder={t('featuredOfferForm.tagsPlaceholder')} className="form-input mt-1"/>
                </div>
            </div>
        </FormSection>

        <FormSection title={t('featuredOfferForm.sectionAutoRequest')}>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="from" className="block text-sm font-medium text-slate-400">{t('global.from')}</label>
                    <input type="text" name="from" id="from" value={formData.requestDetails.from} onChange={handleChange} required className="form-input mt-1"/>
                </div>
                <div>
                    <label htmlFor="to" className="block text-sm font-medium text-slate-400">{t('global.to')}</label>
                    <input type="text" name="to" id="to" value={formData.requestDetails.to} onChange={handleChange} required className="form-input mt-1"/>
                </div>
             </div>
             <div>
                <label htmlFor="tripType" className="block text-sm font-medium text-slate-400">{t('global.tripType')}</label>
                <select name="tripType" id="tripType" value={formData.requestDetails.tripType} onChange={handleChange} className="form-input mt-1">
                    {TRIP_TYPES.map(type => <option key={type} value={type}>{t(`enums.tripType.${type}`)}</option>)}
                </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="departureDate" className="block text-sm font-medium text-slate-400">{t('global.departureDate')}</label>
                    <input type="date" name="departureDate" id="departureDate" value={formData.requestDetails.departureDate} onChange={handleChange} required className="form-input mt-1"/>
                </div>
                <div>
                    <label htmlFor="returnDate" className="block text-sm font-medium text-slate-400">{t('global.returnDate')} ({t('global.optional')})</label>
                    <input type="date" name="returnDate" id="returnDate" value={formData.requestDetails.returnDate} onChange={handleChange} className="form-input mt-1"/>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="travelers" className="block text-sm font-medium text-slate-400">{t('global.travelers')}</label>
                    <input type="number" name="travelers" id="travelers" value={formData.requestDetails.travelers} min="1" onChange={handleChange} required className="form-input mt-1"/>
                 </div>
                 <div>
                    <label htmlFor="comfortLevel" className="block text-sm font-medium text-slate-400">{t('global.comfortLevel')}</label>
                    <select name="comfortLevel" id="comfortLevel" value={formData.requestDetails.comfortLevel} onChange={handleChange} className="form-input mt-1">
                        {COMFORT_LEVELS.map(level => <option key={level} value={level}>{t(`enums.comfortLevel.${level}`)}</option>)}
                    </select>
                 </div>
             </div>
             <div>
                <label htmlFor="tripDescription" className="block text-sm font-medium text-slate-400">{t('featuredOfferForm.autoRequestDescription')}</label>
                <textarea name="tripDescription" id="tripDescription" value={formData.requestDetails.tripDescription} onChange={handleChange} required rows={3} className="form-input mt-1 w-full"></textarea>
             </div>
        </FormSection>

        <div className="pt-4 flex justify-end space-x-3 rtl:space-x-reverse border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>{t('global.cancel')}</Button>
          <Button type="submit">{offer ? t('global.save') : t('featuredOfferForm.createOffer')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default FeaturedOfferFormModal;
