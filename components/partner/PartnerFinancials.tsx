
import React, { useMemo } from 'react';
import Card from '../shared/Card';
import { RialSignIcon, BanknotesIcon, CheckCircleIcon, ClockIcon } from '../icons/Icons';
import { useAppContext } from '../../context/AppContext';
import Tag from '../shared/Tag';
import { useTranslation } from '../../context/LanguageContext';
import Spinner from '../shared/Spinner';

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
        <Card className={`p-5 flex items-start ${colors[color]}`}>
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center`}>
                {React.cloneElement(icon, { className: 'w-7 h-7' })}
            </div>
            <div className="mx-4">
                <p className="text-sm opacity-70">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </Card>
    );
};

interface PartnerFinancialsProps {
    partnerId: string;
    partnerName: string;
}

const PartnerFinancials: React.FC<PartnerFinancialsProps> = ({ partnerId, partnerName }) => {
    const { requests, platformCommissionRate } = useAppContext();
    const { t } = useTranslation();

    const financialData = useMemo(() => {
        return requests
            .filter(r => r.finalOffer?.partnerName === partnerName && (r.status === 'confirmed' || r.status === 'payout_processing' || r.status === 'payment_released' || r.status === 'completed'))
            .map(req => {
                // FIX: Enforce strict financial governance by ONLY using stamped `...AtPayment` values.
                const totalAmount = req.finalPriceAtPayment ?? 0;
                const platformProfit = req.commissionAtPayment ?? 0;
                const payoutAmount = req.payoutAmountAtPayment ?? 0;
                let paymentStatus: 'Due for Payout' | 'Processing' | 'Payment Released';
                
                switch (req.status) {
                    case 'confirmed':
                        paymentStatus = 'Due for Payout';
                        break;
                    case 'payout_processing':
                        paymentStatus = 'Processing';
                        break;
                    case 'payment_released':
                    case 'completed':
                        paymentStatus = 'Payment Released';
                        break;
                    default:
                        paymentStatus = 'Due for Payout';
                }

                return {
                    requestId: req.id,
                    requestTitle: `${req.from} → ${req.to}`,
                    totalAmount,
                    platformProfit,
                    payoutAmount,
                    paymentStatus,
                    payoutId: req.payoutId,
                    payoutDate: req.partnerPayoutDate,
                };
            })
            .sort((a, b) => {
                const dateA = a.payoutDate ? new Date(a.payoutDate) : new Date(0);
                const dateB = b.payoutDate ? new Date(b.payoutDate) : new Date(0);
                return dateB.getTime() - dateA.getTime();
            });
    }, [requests, partnerName]);

    const totalPayoutsMade = financialData.filter(item => item.paymentStatus === 'Payment Released').reduce((sum, item) => sum + item.payoutAmount, 0);
    const pendingPayouts = financialData.filter(item => item.paymentStatus === 'Due for Payout').reduce((sum, item) => sum + item.payoutAmount, 0);
    const completedTrips = financialData.filter(item => item.paymentStatus === 'Payment Released').length;
    
    const getStatusDisplay = (status: typeof financialData[0]['paymentStatus']): React.ReactElement => {
        const key = `partnerFinancials.status.${status.replace(/ /g, '')}`;
        switch(status) {
            case 'Due for Payout':
                return (
                    <div className="flex items-center justify-start gap-2 text-yellow-400">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-bold text-xs">{t(key)}</span>
                    </div>
                );
            case 'Processing':
                return (
                    <div className="flex items-center justify-start gap-2 text-blue-400">
                        <Spinner className="w-4 h-4" /> 
                        <span className="font-bold text-xs">{t(key)}</span>
                    </div>
                );
            case 'Payment Released':
                return (
                    <div className="flex items-center justify-start gap-2 text-green-400">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="font-bold text-xs">{t(key)}</span>
                    </div>
                );
            default:
                return <Tag color="yellow">{t('partnerFinancials.status.Unknown')}</Tag>;
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">{t('partnerFinancials.title')}</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard
                    title={t('partnerFinancials.totalTransferred')}
                    value={`${Math.round(totalPayoutsMade).toLocaleString()} ${t('global.sar')}`}
                    icon={<BanknotesIcon />}
                    color="green"
                />
                <KpiCard
                    title={t('partnerFinancials.dueForPayout')}
                    value={`${Math.round(pendingPayouts).toLocaleString()} ${t('global.sar')}`}
                    icon={<ClockIcon />}
                    color="yellow"
                />
                 <KpiCard
                    title={t('partnerFinancials.completedTrips')}
                    value={completedTrips}
                    icon={<CheckCircleIcon />}
                    color="blue"
                />
            </div>
            
            <Card className="p-5 bg-slate-900/40 border-border">
                <h4 className="font-bold mb-4 text-lg text-white">{t('partnerFinancials.transactionHistory')}</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-950/60">
                            <tr>
                                <th scope="col" className="px-4 py-3">{t('partnerFinancials.table.trip')}</th>
                                <th scope="col" className="px-4 py-3">{t('partnerFinancials.table.offerPrice')}</th>
                                <th scope="col" className="px-4 py-3">{t('partnerFinancials.table.platformCommission')}</th>
                                <th scope="col" className="px-4 py-3">{t('partnerFinancials.table.netPayout')}</th>
                                <th scope="col" className="px-4 py-3">{t('partnerFinancials.table.payoutStatus')}</th>
                                <th scope="col" className="px-4 py-3">{t('partnerFinancials.table.payoutDate')}</th>
                                <th scope="col" className="px-4 py-3">{t('partnerFinancials.table.transactionId')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financialData.map(item => (
                                <tr key={item.requestId} className="border-b border-border hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-white">
                                        {item.requestTitle}
                                        <span className="block text-[10px] font-mono text-slate-500 mt-1">#{item.requestId.split('-')[1].substring(0,6)}</span>
                                    </td>
                                    <td className="px-4 py-4">{item.totalAmount.toLocaleString()} {t('global.sar')}</td>
                                    <td className="px-4 py-4 text-red-400">({item.platformProfit.toLocaleString()} {t('global.sar')})</td>
                                    <td className="px-4 py-4 font-bold text-green-400 text-base">{item.payoutAmount.toLocaleString()} {t('global.sar')}</td>
                                    <td className="px-4 py-4">{getStatusDisplay(item.paymentStatus)}</td>
                                    <td className="px-4 py-4 text-xs">{item.payoutDate ? new Date(item.payoutDate).toLocaleDateString() : '—'}</td>
                                    <td className="px-4 py-4 font-mono text-xs">{item.payoutId || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {financialData.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-slate-500">{t('partnerFinancials.noTransactions')}</p>
                    </div>
                 )}
            </Card>
        </div>
    );
};

export default PartnerFinancials;
