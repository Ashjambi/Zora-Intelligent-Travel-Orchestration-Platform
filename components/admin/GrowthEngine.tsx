
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import { generateGrowthInsights } from '../../services/geminiService';
import Card from '../shared/Card';
import Spinner from '../shared/Spinner';
import * as Icons from '../icons/Icons';
import Button from '../shared/Button';
import Modal from '../shared/Modal';

interface Insight {
    title: string;
    description: string;
    metric: string;
    value: string;
    icon: keyof typeof Icons;
}

interface GrowthInsights {
    topOpportunity: Insight;
    partnerInsight: Insight;
    clientInsight: Insight;
    recommendation: {
        title: string;
        description: string;
    };
}

interface GrowthEngineProps {
    onNavigate: (tab: 'clients' | 'partners') => void;
}

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
    const Icon = Icons[insight.icon] || Icons.InfoIcon;
    return (
        <Card className="p-6 bg-slate-900/50 border-slate-800 flex flex-col">
            <div className="flex items-start gap-4">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-white leading-tight">{insight.title}</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{insight.metric}</p>
                </div>
            </div>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed flex-grow">{insight.description}</p>
            <p className="text-3xl font-black text-white text-right mt-4">{insight.value}</p>
        </Card>
    );
};

const GrowthEngine: React.FC<GrowthEngineProps> = ({ onNavigate }) => {
    const { requests, partners, clients, platformCommissionRate } = useAppContext();
    const { t, language } = useTranslation();
    const [insights, setInsights] = useState<GrowthInsights | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            // Fix: Removed the extra language argument as generateGrowthInsights only accepts data
            const result = await generateGrowthInsights({ requests, partners, clients, commission: platformCommissionRate });
            setInsights(result);
            setIsLoading(false);
        };
        fetchInsights();
    }, [language, requests, partners, clients, platformCommissionRate]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Spinner className="w-16 h-16 text-primary mb-6" />
                <h3 className="text-xl font-black text-white">{t('growthEngine.analyzingTitle')}</h3>
                <p className="text-slate-400 text-sm max-w-sm mt-2">{t('growthEngine.analyzingSubtitle')}</p>
            </div>
        );
    }

    if (!insights) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center opacity-50">
                <Icons.ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mb-6" />
                <h3 className="text-xl font-black text-white">{t('growthEngine.errorTitle')}</h3>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h3 className="text-2xl font-black text-white">{t('growthEngine.title')}</h3>
            
            <Card className="p-8 bg-gradient-to-br from-primary/15 to-slate-900 border-primary/20 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                     <Icons.SparklesIcon className="w-48 h-48 text-primary" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Icons.LightBulbIcon className="w-7 h-7 text-primary animate-pulse"/>
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('growthEngine.recommendation.supertitle')}</span>
                             <h4 className="text-2xl font-black text-white leading-tight">{insights.recommendation.title}</h4>
                        </div>
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed max-w-2xl mb-6">{insights.recommendation.description}</p>
                    <Button onClick={() => setIsActionModalOpen(true)}>
                        {t('growthEngine.recommendation.action')}
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InsightCard insight={insights.topOpportunity} />
                <InsightCard insight={insights.partnerInsight} />
                <InsightCard insight={insights.clientInsight} />
            </div>

            <Modal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                title={t('growthEngine.implementModal.title')}
            >
                <div className="p-4 text-center">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                        <Icons.SparklesIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto">{t('growthEngine.implementModal.description')}</p>
                    <div className="space-y-4">
                        <Button
                            onClick={() => { onNavigate('clients'); setIsActionModalOpen(false); }}
                            className="w-full !py-4"
                        >
                            {t('growthEngine.implementModal.viewClients')}
                        </Button>
                        <Button
                            onClick={() => { onNavigate('partners'); setIsActionModalOpen(false); }}
                            className="w-full !py-4"
                            variant="secondary"
                        >
                            {t('growthEngine.implementModal.viewPartners')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GrowthEngine;
