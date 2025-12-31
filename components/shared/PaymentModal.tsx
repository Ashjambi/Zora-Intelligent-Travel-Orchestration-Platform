
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { RialSignIcon, ShieldIcon, CheckCircleIcon, CreditCardIcon, ExclamationTriangleIcon } from '../icons/Icons';
import Spinner from './Spinner';
import { useTranslation } from '../../context/LanguageContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: (isSuccess: boolean) => void;
  onConfirm: () => void;
  amount: number;
  requestId: string;
}

type PaymentStep = 'input' | 'processing' | 'verifying' | 'success' | 'error';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, amount, requestId }) => {
  const [step, setStep] = useState<PaymentStep>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleRealPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    try {
      // محاكاة الاتصال بـ Gateway البنك
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep('verifying'); 

      // محاكاة نجاح التحقق البنكي 3DS
      setTimeout(() => {
        onConfirm();
        setStep('success');
        setTimeout(() => onClose(true), 2000);
      }, 2000);

    } catch (err: any) {
      setStep('error');
      setErrorMessage(err.message || "Connection Error");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'processing':
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-lg font-bold text-white">{t('paymentModal.processing')}</p>
          </div>
        );
      case 'verifying':
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="bg-blue-500/10 p-5 rounded-full mb-2">
                <ShieldIcon className="w-12 h-12 text-blue-400 animate-pulse" />
            </div>
            <h4 className="text-xl font-black text-white">{t('paymentModal.verifying')}</h4>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">{t('paymentModal.verifyingDesc')}</p>
          </div>
        );
      case 'error':
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="bg-red-500/20 p-5 rounded-full mb-2">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
            </div>
            <h4 className="text-xl font-black text-white">Error</h4>
            <p className="text-sm text-red-400">{errorMessage}</p>
            <Button onClick={() => setStep('input')} variant="secondary" className="mt-4">{t('global.back')}</Button>
          </div>
        );
      case 'success':
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="bg-green-500/20 p-5 rounded-full animate-bounce">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            <h4 className="text-2xl font-black text-white">{t('paymentModal.successTitle')}</h4>
            <p className="text-sm text-slate-400">{t('paymentModal.successDesc')}</p>
          </div>
        );
      case 'input':
      default:
        return (
          <form onSubmit={handleRealPayment} className="space-y-6">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400 font-bold">{t('paymentModal.totalAmount')}</span>
                    <span className="text-3xl font-black text-primary">{amount.toLocaleString()} {t('global.sar')}</span>
                </div>
                <div className="flex items-center text-[10px] text-green-500 font-black uppercase tracking-widest">
                    <ShieldIcon className="w-3 h-3 mx-1" />
                    <span>{t('paymentModal.secureNote')}</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">{t('paymentModal.cardNumber')}</label>
                    <input type="text" placeholder="**** **** **** ****" className="form-input !py-4 font-mono text-lg" required />
                    <CreditCardIcon className="absolute right-4 top-[38px] w-6 h-6 text-slate-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">{t('paymentModal.expiryDate')}</label>
                        <input type="text" placeholder="MM/YY" className="form-input !py-4 text-center font-mono" required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">{t('paymentModal.cvc')}</label>
                        <input type="password" placeholder="***" className="form-input !py-4 text-center font-mono" required />
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full !py-5 !text-xl shadow-2xl shadow-primary/30">
                {t('paymentModal.confirmPayment')}
            </Button>

            <div className="flex items-center justify-center gap-6 opacity-30 grayscale pt-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Mada_Logo.svg" className="h-4" alt="Mada" />
            </div>
          </form>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => (step === 'input' || step === 'success') ? onClose(false) : null} title={t('paymentModal.title')}>
        {renderStep()}
    </Modal>
  );
};

export default PaymentModal;
