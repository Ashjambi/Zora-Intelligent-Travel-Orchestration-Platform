
import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { ShieldIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface LegalAgreementProps {
    partnerName: string;
    onAccept: () => void;
}

const LegalAgreement: React.FC<LegalAgreementProps> = ({ partnerName, onAccept }) => {
    const [hasChecked, setHasChecked] = useState(false);
    const { t } = useTranslation();

    const articles = t('legal.partner.articles', { returnObjects: true }) || [];

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-10 animate-fade-in pb-20">
            <Card className="p-0 border-slate-800 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl border-t-4 border-t-primary">
                <div className="bg-primary/10 p-10 border-b border-primary/20 text-center">
                    <ShieldIcon className="w-20 h-20 text-primary mx-auto mb-6" />
                    <h2 className="text-4xl font-black text-white tracking-tight">{t('legal.partner.title')}</h2>
                    <p className="text-slate-400 mt-2 text-lg font-bold">{t('legal.partner.subtitle')}</p>
                </div>

                <div className="p-8 sm:p-12 space-y-8 text-slate-300 text-sm leading-relaxed max-h-[65vh] overflow-y-auto custom-scrollbar">
                    <p className="text-slate-400 font-medium italic border-b border-slate-800 pb-4">{t('legal.partner.intro')}</p>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {Array.isArray(articles) && articles.map((art: any) => (
                            <section key={art.id} className={`p-6 rounded-3xl border transition-all ${art.id === 6 ? 'border-red-500/30 bg-red-500/5 shadow-lg' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}>
                                <h3 className={`text-xl font-black mb-4 flex items-center gap-3 ${art.id === 6 ? 'text-red-500' : 'text-white'}`}>
                                    {art.id === 6 ? <ExclamationTriangleIcon className="w-6 h-6" /> : <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-primary">{art.id}</span>}
                                    {art.title.includes(':') ? art.title.split(':').slice(1).join(':').trim() : art.title}
                                </h3>
                                <p className={`leading-relaxed ${art.id === 6 ? 'font-bold text-slate-200' : 'text-slate-400'}`}>{art.desc}</p>
                            </section>
                        ))}
                    </div>
                </div>

                <div className="p-10 bg-slate-950 border-t border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col items-center gap-8">
                        <label className="flex items-start gap-6 cursor-pointer group max-w-3xl">
                            <input 
                                type="checkbox" 
                                checked={hasChecked} 
                                onChange={(e) => setHasChecked(e.target.checked)}
                                className="mt-1.5 w-7 h-7 rounded-lg border-slate-700 bg-slate-800 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className="text-base font-bold text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">
                                {t('legal.partner.acceptCheckbox')} ({partnerName})
                            </span>
                        </label>
                        <Button onClick={onAccept} disabled={!hasChecked} className="w-full max-w-lg !py-5 !text-xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95">
                            {t('legal.partner.button')}
                        </Button>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
                            {t('legal.partner.footer')}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LegalAgreement;
