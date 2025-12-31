
import React, { useMemo, useState, useEffect } from 'react';
import Card from '../shared/Card';
import { RialSignIcon, PlaneIcon, ClockIcon, BuildingOfficeIcon, SendIcon, CheckCircleIcon, PlusCircleIcon, ExclamationTriangleIcon, SparklesIcon } from '../icons/Icons';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import Tag from '../shared/Tag';
import { generateAIRadarAlert } from '../../services/geminiService';
import { TravelRequest } from '../../types';
import Spinner from '../shared/Spinner';
import Button from '../shared/Button';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement;
    color: 'green' | 'blue' | 'yellow' | 'purple';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color }) => {
    const colors = {
        green: 'bg-green-500/10 text-green-400 border border-green-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    };

    return (
        <Card className={`p-6 ${colors[color]}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900/80 shadow-inner`}>
                    {React.cloneElement(icon, { className: 'w-7 h-7' })}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{title}</p>
                    <p className="text-2xl font-black text-white">{value}</p>
                </div>
            </div>
        </Card>
    );
};

interface RadarAlert extends TravelRequest {
    aiRadarAlert: NonNullable<TravelRequest['aiRadarAlert']>;
}

interface DashboardProps {
    onNavigateToRequest: (requestId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToRequest }) => {
    const { requests, clients, financialMetrics } = useAppContext();
    const { t, language } = useTranslation();
    const [radarAlerts, setRadarAlerts] = useState<RadarAlert[]>([]);
    const [isLoadingRadar, setIsLoadingRadar] = useState(true);

    const getTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return t('global.sinceDays', { days: Math.floor(interval) });
        interval = seconds / 3600;
        if (interval > 1) return t('global.sinceHours', { hours: Math.floor(interval) });
        interval = seconds / 60;
        if (interval > 1) return t('global.sinceMinutes', { minutes: Math.floor(interval) });
        return t('global.now');
    };

    useEffect(() => {
        const fetchRadarAlerts = async () => {
            setIsLoadingRadar(true);
            const criticalRequests = requests
                .filter(r => ['new_request', 'pending_bids', 'offer_ready', 'revision_requested'].includes(r.status))
                .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
                .slice(0, 4); 

            const results: RadarAlert[] = [];
            for (const req of criticalRequests) {
                // Fix: Removed the extra language argument as generateAIRadarAlert only accepts request
                const alert = await generateAIRadarAlert(req);
                if (alert) {
                    results.push({ ...req, aiRadarAlert: alert });
                }
            }
            
            setRadarAlerts(results);
            setIsLoadingRadar(false);
        };
        fetchRadarAlerts();
    }, [requests, language]);
    
    // FIX: Consume centralized financial metrics and calculate non-financial metrics separately.
    const { totalRevenue, totalProfit, pendingPayouts } = financialMetrics;
    const activeRequestsCount = useMemo(() => {
        return requests.filter(r => ['new_request', 'pending_bids', 'analyzing', 'offer_ready'].includes(r.status)).length;
    }, [requests]);


    const radarCategoryIcons: { [key in RadarAlert['aiRadarAlert']['category']]: React.ReactElement } = {
        Financial: <RialSignIcon className="w-6 h-6" />,
        Operational: <ExclamationTriangleIcon className="w-6 h-6" />,
        UrgentFollowUp: <ClockIcon className="w-6 h-6" />,
    };

    const radarSeverityColors: { [key in RadarAlert['aiRadarAlert']['severity']]: 'red' | 'yellow' | 'blue' } = {
        High: 'red',
        Medium: 'yellow',
        Low: 'blue',
    };
    
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <KpiCard title={t('dashboard.totalRevenue')} value={`${totalRevenue.toLocaleString(t('global.locale'))} ${t('global.sar')}`} icon={<RialSignIcon />} color="green" />
                <KpiCard title={t('dashboard.totalProfit')} value={`${Math.round(totalProfit).toLocaleString(t('global.locale'))} ${t('global.sar')}`} icon={<RialSignIcon />} color="green" />
                <KpiCard title={t('dashboard.activeRequests')} value={activeRequestsCount} icon={<PlaneIcon />} color="blue" />
                <KpiCard title={t('financialsDashboard.outstandingDues')} value={`${Math.round(pendingPayouts).toLocaleString(t('global.locale'))} ${t('global.sar')}`} icon={<ClockIcon />} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-950 border-primary/20 min-h-[300px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl text-white flex items-center gap-3">
                                <SparklesIcon className="w-6 h-6 text-primary" />
                                {t('dashboard.aiRadar.title')}
                            </h3>
                            <Tag color="purple">{t('dashboard.liveUpdate')}</Tag>
                        </div>
                        {isLoadingRadar ? (
                            <div className="flex justify-center items-center h-48">
                                <Spinner className="w-10 h-10" />
                            </div>
                        ) : radarAlerts.length > 0 ? (
                            <div className="space-y-4">
                                {radarAlerts.map(alert => (
                                    <div key={alert.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/40 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black ${alert.aiRadarAlert.severity === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                {radarCategoryIcons[alert.aiRadarAlert.category]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm leading-snug">{alert.aiRadarAlert.message}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">
                                                    {clients.find(c => c.id === alert.clientId)?.name} - {alert.to} (#{alert.id.substring(0,6)})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
                                            <Tag color={radarSeverityColors[alert.aiRadarAlert.severity]}>
                                                {t(`dashboard.aiRadar.severities.${alert.aiRadarAlert.severity}`)}
                                            </Tag>
                                            <Button onClick={() => onNavigateToRequest(alert.id)} variant="secondary" className="!text-[10px] !py-2 !px-3 !rounded-lg w-full sm:w-auto">
                                                {t('dashboard.aiRadar.goToRequest')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-48 text-center">
                                <CheckCircleIcon className="w-12 h-12 text-green-500/30 mb-4" />
                                <p className="text-sm font-bold text-slate-500">{t('dashboard.aiRadar.noAlerts')}</p>
                            </div>
                        )}
                    </Card>

                    <Card className="p-6 sm:p-8">
                        <h3 className="font-black mb-6 text-xl text-white">{t('dashboard.financialOverview')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl">
                                <span className="font-bold text-xs text-slate-500 uppercase">{t('dashboard.realizedRevenue')}</span>
                                <p className="text-3xl font-black text-green-400 mt-2">{totalRevenue.toLocaleString(t('global.locale'))} {t('global.sar')}</p>
                            </div>
                            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl">
                                <span className="font-bold text-xs text-slate-500 uppercase">{t('dashboard.platformProfit')}</span>
                                <p className="text-3xl font-black text-primary mt-2">{Math.round(totalProfit).toLocaleString(t('global.locale'))} {t('global.sar')}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-6 sm:p-8 bg-slate-900/60 border-slate-800">
                     <h3 className="font-black mb-6 text-xl text-white tracking-tight">{t('dashboard.governanceLog')}</h3>
                     <div className="space-y-6">
                        {requests.slice(0, 8).map(req => (
                            <div key={req.id} className="flex items-start space-x-4 rtl:space-x-reverse border-b border-white/5 pb-4 last:border-0">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                                    <PlusCircleIcon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-200 leading-snug">
                                        {t('dashboard.newRequestFrom', { client: clients.find(c => c.id === req.clientId)?.name || '...', to: req.to })}
                                    </p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mt-1">{getTimeAgo(req.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
