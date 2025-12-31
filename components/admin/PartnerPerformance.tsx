
import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import Card from '../shared/Card';
import { StarIcon, ClockIcon, ChartBarIcon, BanknotesIcon, CheckCircleIcon } from '../icons/Icons';
import Tag from '../shared/Tag';

const PartnerPerformance: React.FC = () => {
    const { partners, requests } = useAppContext();
    const { t, language } = useTranslation();

    const partnerMetrics = useMemo(() => {
        return partners.map(partner => {
            const partnerRequests = requests.filter(r => r.finalOffer?.partnerName === partner.name && (r.status === 'confirmed' || r.status === 'payout_processing' || r.status === 'payment_released' || r.status === 'completed'));
            const allPartnerOffers = requests.flatMap(r => r.offers.filter(o => o.partnerName === partner.name));
            
            const totalBookings = partnerRequests.length;
            const totalRevenue = partnerRequests.reduce((sum, r) => sum + (r.finalOffer?.price || 0), 0);
            const totalPayouts = requests
                .filter(r => r.finalOffer?.partnerName === partner.name && (r.status === 'payment_released' || r.status === 'completed'))
                .reduce((sum, r) => sum + (r.payoutAmountAtPayment || 0), 0);

            const avgResponseTime = allPartnerOffers.length > 0 
                ? (allPartnerOffers.reduce((sum, o) => sum + (o.responseTime || 24), 0) / allPartnerOffers.length)
                : 0;

            return {
                ...partner,
                totalBookings,
                totalRevenue,
                totalPayouts,
                avgResponseTime,
            };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [partners, requests]);

    const topPartner = partnerMetrics[0];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <ChartBarIcon className="w-7 h-7 text-primary" />
                    {t('partnerPerformance.title')}
                </h3>
            </div>

            {topPartner && (
                <Card className="p-8 bg-gradient-to-br from-primary/10 to-slate-900 border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                         <StarIcon className="w-48 h-48 text-primary" />
                    </div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">{t('partnerPerformance.topSellingPartner')}</span>
                            <h4 className="text-4xl font-black text-white leading-tight">{topPartner.name}</h4>
                            <p className="text-slate-400 text-sm mt-2">{topPartner.specialty}</p>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center md:text-left rtl:md:text-right">
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{t('partnerPerformance.totalSales')}</p>
                                <p className="text-2xl font-black text-primary">{topPartner.totalRevenue.toLocaleString()} <span className="text-xs">{t('global.sar')}</span></p>
                            </div>
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{t('partnerPerformance.confirmedBookings')}</p>
                                <p className="text-2xl font-black text-white">{topPartner.totalBookings}</p>
                            </div>
                             <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{t('partnerPerformance.rating')}</p>
                                <p className="text-2xl font-black text-yellow-400 flex items-center justify-center md:justify-start gap-2">{topPartner.rating} <StarIcon className="w-5 h-5"/></p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="p-0 overflow-hidden border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left rtl:text-right text-slate-400 min-w-[1000px]">
                        <thead className="text-[10px] font-black uppercase bg-slate-950/60 text-slate-500 tracking-widest border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-5">{t('partnerPerformance.table.partner')}</th>
                                <th className="px-6 py-5">{t('partnerPerformance.table.tier')}</th>
                                <th className="px-6 py-5 text-center">{t('partnerPerformance.table.bookings')}</th>
                                <th className="px-6 py-5 text-center">{t('partnerPerformance.table.responseTime')}</th>
                                <th className="px-6 py-5 text-center">{t('partnerPerformance.table.rating')}</th>
                                <th className="px-6 py-5 text-right rtl:text-left">{t('partnerPerformance.table.totalRevenue')}</th>
                                <th className="px-6 py-5 text-right rtl:text-left">{t('partnerPerformance.table.totalPayouts')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {partnerMetrics.map(p => (
                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-base text-white group-hover:text-primary transition-colors">{p.name}</span>
                                            <span className="text-[10px] opacity-50 font-mono">#{p.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Tag color={p.performanceTier === 'Elite' ? 'green' : p.performanceTier === 'Preferred' ? 'blue' : 'yellow'}>
                                            {t(`enums.performanceTier.${p.performanceTier}`)}
                                        </Tag>
                                    </td>
                                    <td className="px-6 py-5 text-center font-bold text-lg text-slate-200">
                                        {p.totalBookings}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-blue-400 font-bold">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            {p.avgResponseTime.toLocaleString(language, {maximumFractionDigits: 1})} {t('partnerPerformance.hours')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex items-center justify-center gap-1 text-yellow-400 font-black">
                                            <StarIcon className="w-4 h-4" />
                                            {p.rating.toFixed(1)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right rtl:text-left">
                                        <span className="font-black text-white text-base">{p.totalRevenue.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-600 mx-1">{t('global.sar')}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right rtl:text-left">
                                        <span className="font-black text-green-500 text-base">{p.totalPayouts.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-600 mx-1">{t('global.sar')}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default PartnerPerformance;
