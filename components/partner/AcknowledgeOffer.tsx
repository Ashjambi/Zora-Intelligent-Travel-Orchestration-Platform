
import React from 'react';
import { TravelRequest } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { PlaneIcon, CalendarIcon, UsersIcon, CheckCircleIcon } from '../icons/Icons';
import Tag from '../shared/Tag';
import { useTranslation } from '../../context/LanguageContext';

interface AcknowledgeOfferProps {
  request: TravelRequest;
  onAcknowledged: (successMessage: string) => void;
}

const AcknowledgeOffer: React.FC<AcknowledgeOfferProps> = ({ request, onAcknowledged }) => {
  const { acknowledgeFeaturedOfferRequest } = useAppContext();
  const { t } = useTranslation();

  const handleAcknowledge = () => {
    const justification = t('acknowledgeOffer.justification');
    const category = t('acknowledgeOffer.category');
    acknowledgeFeaturedOfferRequest(request.id, justification, category);
    onAcknowledged(t('notifications.bookingConfirmed'));
  };

  return (
    <Card className="p-6 sticky top-28">
      <div className="text-center">
        <Tag color="purple">{t('acknowledgeOffer.tag')}</Tag>
        <h3 className="text-2xl font-bold mt-3 mb-2 text-gray-800 dark:text-white">{t('acknowledgeOffer.title')}</h3>
        <p className="text-gray-600 dark:text-gray-400">{t('acknowledgeOffer.subtitle')}</p>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center text-lg font-bold">
          <PlaneIcon className="w-5 h-5 mx-2 text-gray-400" />
          <span>{request.from} → {request.to}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong className="block text-gray-500 dark:text-gray-400">{t('global.departureDate')}:</strong> {request.departureDate}{request.returnDate && ` - ${request.returnDate}`}</div>
          <div><strong className="block text-gray-500 dark:text-gray-400">{t('global.travelers')}:</strong> {request.travelers}</div>
          <div><strong className="block text-gray-500 dark:text-gray-400">{t('global.comfortLevel')}:</strong> {t(`enums.comfortLevel.${request.comfortLevel}`)}</div>
          <div><strong className="block text-gray-500 dark:text-gray-400">{t('acknowledgeOffer.agreedPrice')}</strong> <span className="font-bold text-green-600">{request.budget.toLocaleString()} {t('global.sar')}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{t('acknowledgeOffer.tripDescription')}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{request.tripDescription}"</p>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleAcknowledge} className="w-full">
          {t('acknowledgeOffer.button')}
        </Button>
      </div>
    </Card>
  );
};

export default AcknowledgeOffer;
