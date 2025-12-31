
import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { ShieldIcon, CheckCircleIcon, UserGroupIcon, ExclamationTriangleIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface ClientLegalAgreementProps {
    clientName: string;
    onAccept: () => void;
}

const ClientLegalAgreement: React.FC<ClientLegalAgreementProps> = ({ clientName, onAccept }) => {
    const [hasChecked, setHasChecked] = useState(false);
    const { t } = useTranslation();

    const articles = t('legal.client.articles', { returnObjects: true }) || [];

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-10 animate-fade-in pb-20">
            <Card className="p-0 border-slate-800 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl border-t-4 border-t-primary">
                <div className="bg-primary/10 p-10 border-b border-primary/20 text-center">
                    <UserGroupIcon className="w-20 h-20 text-primary mx-auto mb-6" />
                    <h2 className="text-4xl font-black text-white tracking-tight">{t('legal.client.title')}</h2>
                    <p className="text-slate-400 mt-2 text-lg font-bold">{t('legal.client.subtitle')}</p>
                </div>

                <div className="p-8 sm:p-12 space-y-8 text-slate-300 text-sm leading-relaxed max-h-[65vh] overflow-y-auto custom-scrollbar">
                    <p className="text-slate-400 font-medium italic border-b border-slate-800 pb-4">{t('legal.client.intro')}</p>

                    {Array.isArray(articles) && articles.map((art: any) => (
                        <section key={art.id} className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 transition-all hover:border-slate-700">
                            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                                {art.id === 5 || art.id === 6 ? <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /> : <span className="w-2 h-2 bg-primary rounded-full"></span>}
                                {art.title}
                            </h3>
                            <p>{art.desc}</p>
                        </section>
                    ))}
                </div>

                <div className="p-10 bg-slate-950 border-t border-slate-800">
                    <div className="flex flex-col items-center gap-8">
                        <label className="flex items-start gap-6 cursor-pointer group max-w-3xl">
                            <input 
                                type="checkbox" 
                                checked={hasChecked} 
                                onChange={(e) => setHasChecked(e.target.checked)}
                                className="mt-1.5 w-7 h-7 rounded-lg border-slate-700 bg-slate-800 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className="text-base font-bold text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">
                                {t('legal.client.acceptCheckbox')} ({clientName})
                            </span>
                        </label>
                        <Button onClick={onAccept} disabled={!hasChecked} className="w-full max-w-lg !py-5 !text-xl font-black shadow-2xl shadow-primary/20">
                            {t('legal.client.button')}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ClientLegalAgreement;
