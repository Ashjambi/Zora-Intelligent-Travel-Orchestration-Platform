
import React, { useState, useEffect } from 'react';
import { PartnerOffer, TravelDay } from '../../types';
import Button from '../shared/Button';
import { RialSignIcon, InfoIcon, ShieldIcon, CalendarIcon, PlusCircleIcon, TrashIcon } from '../icons/Icons';
import Modal from '../shared/Modal';
import { useTranslation } from '../../context/LanguageContext';

interface OfferFormProps {
  onSubmit: (offer: Omit<PartnerOffer, 'id'>) => void;
  partnerName: string;
  initialData?: PartnerOffer;
}

const OfferForm: React.FC<OfferFormProps> = ({ onSubmit, partnerName, initialData }) => {
  const { t } = useTranslation();
  const [offerToConfirm, setOfferToConfirm] = useState<Omit<PartnerOffer, 'id'> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({ 
    price: initialData?.price ? String(initialData.price) : '', 
    details: initialData?.details || '', 
    cancellationPolicy: initialData?.cancellationPolicy || (t('global.locale') === 'ar-SA' ? 'سياسة مرنة بالكامل' : 'Fully flexible policy')
  });

  const [itinerary, setItinerary] = useState<TravelDay[]>(initialData?.itinerary || [
      { day: 1, title: t('global.locale') === 'ar-SA' ? 'الوصول والاستقبال' : 'Arrival & Welcome', activities: [{ time: 'Morning', description: t('global.locale') === 'ar-SA' ? 'الاستقبال في المطار والتوجه للفندق' : 'Airport pickup and hotel check-in' }] }
  ]);

  useEffect(() => {
    if (initialData) {
      setFormState({
        price: String(initialData.price),
        details: initialData.details,
        cancellationPolicy: initialData.cancellationPolicy
      });
      setItinerary(initialData.itinerary || []);
    }
  }, [initialData]);

  const addDay = () => {
      setItinerary([...itinerary, { day: itinerary.length + 1, title: '', activities: [{ time: 'Morning', description: '' }] }]);
  };

  const removeDay = (index: number) => {
      setItinerary(itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 })));
  };

  const updateDay = (index: number, field: string, value: string) => {
      const newItinerary = [...itinerary];
      (newItinerary[index] as any)[field] = value;
      setItinerary(newItinerary);
  };

  const updateActivity = (dayIndex: number, actIndex: number, field: string, value: string) => {
      const newItinerary = [...itinerary];
      (newItinerary[dayIndex].activities[actIndex] as any)[field] = value;
      setItinerary(newItinerary);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(formState.price, 10);
    if (isNaN(priceNum) || priceNum <= 0) return;

    setOfferToConfirm({
      partnerName,
      partnerRating: 4.8, 
      price: priceNum,
      details: formState.details,
      cancellationPolicy: formState.cancellationPolicy,
      responseTime: 1,
      itinerary: itinerary
    });
  };

  const handleConfirm = () => {
    if (offerToConfirm && !isSubmitting) {
      setIsSubmitting(true);
      onSubmit(offerToConfirm);
      setOfferToConfirm(null);
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
          <div className="bg-primary/20 p-2 rounded-xl"><RialSignIcon className="w-5 h-5 text-primary" /></div>
          <div>
              <h4 className="font-black text-lg text-white">{t('offerForm.title')}</h4>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{t('offerForm.subtitle')}</p>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t('offerForm.priceLabel')}</label>
                    <input type="number" name="price" value={formState.price} onChange={e => setFormState({...formState, price: e.target.value})} required className="form-input w-full font-black text-2xl text-primary" placeholder="0" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t('offerForm.detailsLabel')}</label>
                    <textarea name="details" value={formState.details} onChange={e => setFormState({...formState, details: e.target.value})} rows={4} required className="form-input w-full text-sm" placeholder={t('offerForm.detailsPlaceholder')} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('offerForm.itineraryLabel')}</label>
                    <button type="button" onClick={addDay} className="text-primary hover:text-white transition-colors flex items-center gap-1 text-[10px] font-black uppercase">
                        <PlusCircleIcon className="w-4 h-4" /> {t('offerForm.addDay')}
                    </button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pe-2">
                    {itinerary.map((day, idx) => (
                        <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl relative group">
                            <button type="button" onClick={() => removeDay(idx)} className="absolute top-2 left-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black text-primary">{t('offerForm.dayLabel', { day: day.day })}</span>
                                <input type="text" value={day.title} onChange={e => updateDay(idx, 'title', e.target.value)} placeholder={t('offerForm.dayTitlePlaceholder')} className="bg-transparent border-none focus:ring-0 text-xs font-bold text-white w-full p-0" />
                            </div>
                            <textarea value={day.activities[0].description} onChange={e => updateActivity(idx, 0, 'description', e.target.value)} rows={2} placeholder={t('offerForm.activityPlaceholder')} className="bg-transparent border-none focus:ring-0 text-[11px] text-slate-400 w-full p-0 leading-relaxed" />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <Button type="submit" className="w-full !py-4 font-black shadow-2xl">{t('offerForm.submitButton')}</Button>
      </form>

      <Modal isOpen={!!offerToConfirm} onClose={() => setOfferToConfirm(null)} title={t('offerForm.confirmModalTitle')}>
        {offerToConfirm && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-baseline mb-4 border-b border-slate-800 pb-4">
                    <span className="text-xs font-bold text-slate-400">{t('offerForm.confirmPriceLabel')}</span>
                    <span className="text-3xl font-black text-primary">{offerToConfirm.price.toLocaleString()} {t('global.sar')}</span>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase">{t('offerForm.confirmItineraryLabel', { count: offerToConfirm.itinerary?.length })}</p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                        {offerToConfirm.itinerary?.map((d, i) => (
                            <div key={i} className="text-[11px] text-slate-300 flex gap-2">
                                <span className="font-bold text-primary shrink-0">{t('offerForm.dayLabel', { day: d.day })}:</span>
                                <span className="truncate">{d.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setOfferToConfirm(null)}>{t('offerForm.back')}</Button>
              <Button onClick={handleConfirm} loading={isSubmitting}>{t('offerForm.confirmAndSend')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OfferForm;
