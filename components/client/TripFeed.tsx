import React from 'react';
import { TripFeedItem } from '../../types';
import Card from '../shared/Card';
import * as Icons from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface LiveTripFeedProps {
    feedItems: TripFeedItem[];
}

// A mapping from the icon string name to the actual component
const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    CalendarIcon: Icons.CalendarIcon,
    SunIcon: Icons.SunIcon,
    CarIcon: Icons.CarIcon,
    TrainIcon: Icons.TrainIcon,
    LandmarkIcon: Icons.LandmarkIcon,
    LightBulbIcon: Icons.LightBulbIcon,
    PlaneIcon: Icons.PlaneIcon,
    MapPinIcon: Icons.MapPinIcon,
    ExclamationTriangleIcon: Icons.ExclamationTriangleIcon,
    CheckBadgeIcon: Icons.CheckBadgeIcon,
    Default: Icons.InfoIcon,
};

const categoryStyles: { [key: string]: { bg: string, text: string, border: string } } = {
    Reminder: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
    Weather: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    Attraction: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    Transport: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
    Tip: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    Alert: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
    UserAction: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    Itinerary: { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
};


const LiveTripFeed: React.FC<LiveTripFeedProps> = ({ feedItems }) => {
    const { t } = useTranslation();

    if (!feedItems || feedItems.length === 0) {
        return (
            <div className="text-center py-10">
                <Icons.ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t('tripFeed.noUpdates')}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
           {feedItems.map(item => {
               const IconComponent = iconMap[item.icon] || iconMap.Default;
               const styles = categoryStyles[item.category] || categoryStyles.Tip;

               return (
                <div key={item.id} className={`p-4 flex items-start space-x-4 rtl:space-x-reverse rounded-lg border ${styles.bg} ${styles.border}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.text} bg-white dark:bg-gray-700`}>
                        <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <h4 className={`font-bold ${styles.text}`}>{item.title}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.description}</p>
                    </div>
                </div>
               )
           })}
        </div>
    );
};

export default LiveTripFeed;