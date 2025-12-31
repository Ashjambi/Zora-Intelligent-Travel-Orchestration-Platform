
import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;
  const { t } = useTranslation();

  const sizeClasses = {
    default: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-6xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className={`bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale overflow-hidden ${sizeClasses[size]}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-black text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            aria-label={t('global.close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
       <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Modal;
