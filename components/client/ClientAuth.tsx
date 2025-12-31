
import React, { useState } from 'react';
import Button from '../shared/Button';
import * as Icons from '../icons/Icons';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import ClientLegalAgreement from './ClientLegalAgreement';
import { Client } from '../../types';

interface ClientAuthProps {
    onAuthenticated: (clientId: string) => void;
}

const ClientAuth: React.FC<ClientAuthProps> = ({ onAuthenticated }) => {
    const { clients, addClient } = useAppContext();
    const { t } = useTranslation();
    const [step, setStep] = useState<'email' | 'login' | 'register'>('email');
    const [showAgreement, setShowAgreement] = useState(false);
    
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [destinations, setDestinations] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [foundClient, setFoundClient] = useState<Client | null>(null);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError(t('clientAuth.invalidEmail'));
            return;
        }
        setError(null);
        const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (client) {
            setFoundClient(client);
            setStep('login');
        } else {
            setStep('register');
        }
    };

    const handleStartRegistration = (e: React.FormEvent) => {
        e.preventDefault();
        setShowAgreement(true);
    };

    const handleAcceptAgreement = () => {
        const newClientData = {
            name,
            email,
            phone,
            preferredDestinations: destinations,
            agreementSignedAt: new Date().toISOString(),
            agreementVersion: "2.1"
        };
        const newClient = addClient(newClientData);
        onAuthenticated(newClient.id);
    };
    
    const handleDemoLogin = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) onAuthenticated(client.id);
    };
    
    const handleBack = () => {
        setError(null);
        setStep('email');
        setFoundClient(null);
    };

    if (showAgreement) {
        return <ClientLegalAgreement clientName={name} onAccept={handleAcceptAgreement} />;
    }

    const renderStepContent = () => {
        switch(step) {
            case 'login':
                return (
                    <div className="text-center animate-fade-in-up">
                        <Icons.UserGroupIcon className="w-20 h-20 text-primary bg-primary/10 p-4 rounded-[2rem] mx-auto mb-6 border border-primary/20" />
                        <h2 className="text-2xl font-black text-white">{t('clientAuth.welcomeBack', { name: foundClient?.name })}</h2>
                        <p className="text-slate-400 mt-2">{foundClient?.email}</p>
                        <Button onClick={() => onAuthenticated(foundClient!.id)} className="w-full !py-4 !text-lg mt-8">
                            {t('clientAuth.secureLogin')}
                        </Button>
                        <button onClick={handleBack} className="text-[10px] font-black text-slate-500 hover:text-white mt-6 uppercase tracking-widest transition-colors">{t('clientAuth.backButton')}</button>
                    </div>
                );
            case 'register':
                return (
                    <div className="animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-white">{t('clientAuth.registerTitle')}</h2>
                            <p className="text-slate-400 text-sm mt-2 font-medium">{t('clientAuth.registerSubtitle')}</p>
                        </div>
                        <form onSubmit={handleStartRegistration} className="space-y-5">
                             <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('global.email')}</label>
                                <input type="email" value={email} disabled className="form-input w-full mt-2 bg-slate-800/50 opacity-70" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('clientAuth.nameLabel')}</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-input w-full mt-2" placeholder={t('clientAuth.nameLabel')} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('clientAuth.phoneLabel')}</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="form-input w-full mt-2" placeholder={t('clientAuth.phonePlaceholder')} />
                            </div>
                             <Button type="submit" className="w-full !py-4 !text-lg !mt-8">
                                {t('clientAuth.createAndContinue')}
                            </Button>
                            <button type="button" onClick={handleBack} className="text-[10px] font-black text-slate-500 hover:text-white mt-6 uppercase tracking-widest transition-colors w-full">{t('clientAuth.backButton')}</button>
                        </form>
                    </div>
                );
            case 'email':
            default:
                return (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <Icons.SparklesIcon className="w-16 h-16 text-primary bg-primary/10 p-3 rounded-[1.5rem] mx-auto mb-6 border border-primary/20" />
                            <h2 className="text-3xl font-black text-white drop-shadow-md">{t('clientAuth.gatewayTitle')}</h2>
                            <p className="text-slate-400 text-sm mt-2 font-medium">{t('clientAuth.emailPrompt')}</p>
                        </div>
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input w-full !py-4 !text-center text-lg shadow-xl" placeholder={t('clientAuth.emailPlaceholder')} />
                             {error && <p className="text-xs text-red-400 text-center font-bold animate-shake">{error}</p>}
                            <Button type="submit" className="w-full !py-4 !text-lg shadow-2xl shadow-primary/20">
                                {t('clientAuth.continue')}
                            </Button>
                        </form>
                        <div className="mt-10">
                            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div><div className="relative flex justify-center"><span className="bg-slate-900 px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('global.or')}</span></div></div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center mb-4">{t('clientAuth.demoSubtitle')}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button variant="secondary" onClick={() => handleDemoLogin('C-1')} className="!justify-start !p-3 !h-auto !bg-white/5 hover:!bg-primary/10 border-white/5 hover:border-primary/30"><span className="font-bold text-xs text-slate-300">{t('clientAuth.demoUser1')}</span></Button>
                                <Button variant="secondary" onClick={() => handleDemoLogin('C-2')} className="!justify-start !p-3 !h-auto !bg-white/5 hover:!bg-primary/10 border-white/5 hover:border-primary/30"><span className="font-bold text-xs text-slate-300">{t('clientAuth.demoUser2')}</span></Button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="relative -m-4 sm:-m-6 overflow-hidden min-h-[500px] flex flex-col justify-center">
            <div 
                className="absolute inset-0 bg-cover bg-center z-0 scale-110"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2070&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-0" />
            
            <div className="relative z-10 w-full max-w-sm mx-auto py-10 px-6">
                {renderStepContent()}
            </div>
        </div>
    );
};

export default ClientAuth;
