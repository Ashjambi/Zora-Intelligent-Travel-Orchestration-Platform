
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InfoIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const iconClasses = isSuccess 
    ? 'text-green-400 bg-green-500/20' 
    : isError
    ? 'text-red-400 bg-red-500/20'
    : 'text-blue-400 bg-blue-500/20';

  const Icon = isSuccess ? CheckCircleIcon : isError ? XCircleIcon : InfoIcon;

  const baseClasses = 'fixed top-6 right-6 rtl:right-auto rtl:left-6 z-[300] flex items-center w-full max-w-sm p-4 space-x-4 rtl:space-x-reverse text-slate-100 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all animate-fade-in-down';
  
  return (
    <div className={baseClasses} role="alert">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-xl ${iconClasses} shadow-inner`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 mx-3 text-sm font-bold leading-relaxed">{message}</div>
      <button 
        type="button" 
        className="ms-auto p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors" 
        onClick={onClose}
        aria-label={t('global.close')}
      >
        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate3d(0, -30%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Notification;
