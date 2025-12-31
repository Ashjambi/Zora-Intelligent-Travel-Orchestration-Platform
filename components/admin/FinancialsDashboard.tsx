
import React, { useMemo, useState } from 'react';
import Card from '../shared/Card';
import { RialSignIcon, BanknotesIcon, CheckCircleIcon, ClockIcon, SendIcon, XCircleIcon, ArrowDownTrayIcon } from '../icons/Icons';
import { useAppContext } from '../../context/AppContext';
import Tag from '../shared/Tag';
import Button from '../shared/Button';
import { useTranslation } from '../../context/LanguageContext';
import Modal from '../shared/Modal';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement;
    color: 'green' | 'blue' | 'yellow' | 'purple' | 'red';
    onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, onClick }) => {
    const colors = {
        green: 'bg-green-500/10 text-green-400 border border-green-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
        red: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };

    return (
        <Card 
            className={`p-5 ${colors[color]} ${onClick ? 'cursor-pointer hover:scale-105 hover:border-primary/40 transition-all' : ''}`}
            onClick={onClick}
        >
            <div className="flex flex-col">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900/60 shadow-inner mb-3`}>
                    {React.cloneElement(icon, { className: 'w-6 h-6' })}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">{value}</p>
            </div>
        </Card>
    );
};


const FinancialsDashboard: React.FC = () => {
    const { requests, clients, releasePartnerPayment, platformCommissionRate, setPlatformCommissionRate, financialMetrics } = useAppContext();
    const { t, language } = useTranslation();
    const [modalContent, setModalContent] = useState<{ title: string; items: { id: string, name: string, amount: number }[]; total: number } | null>(null);

    const financialData = useMemo(() => {
        return requests
            .filter(r => r.status === 'pending_payment' || r.status === 'payment_failed' || r.status === 'confirmed' || r.status === 'payout_processing' || r.status === 'payment_released' || r.status === 'completed')
            .map(req => {
                const client = clients.find(c => c.id === req.clientId);
                
                const totalAmount = (req.status === 'pending_payment' || req.status === 'payment_failed')
                    ? (req.finalOffer?.price ?? 0)
                    : (req.finalPriceAtPayment ?? 0);
                
                const platformProfit = req.commissionAtPayment ?? 0;
                const payoutAmount = req.payoutAmountAtPayment ?? 0;

                let paymentStatus: 'Due for Payout' | 'Processing' | 'Payment Released' | 'Pending Client Payment' | 'Payment Failed';
                
                switch (req.status) {
                    case 'pending_payment': paymentStatus = 'Pending Client Payment'; break;
                    case 'payment_failed': paymentStatus = 'Payment Failed'; break;
                    case 'confirmed': paymentStatus = 'Due for Payout'; break;
                    case 'payout_processing': paymentStatus = 'Processing'; break;
                    case 'payment_released': case 'completed': paymentStatus = 'Payment Released'; break;
                    default: paymentStatus = 'Pending Client Payment';
                }

                return {
                    requestId: req.id,
                    partnerName: req.finalOffer?.partnerName || 'N/A',
                    clientName: client?.name || t('admin.requestListItem.unknownClient'),
                    totalAmount,
                    platformProfit,
                    payoutAmount,
                    paymentStatus,
                    transactionId: req.transactionId,
                    payoutId: req.payoutId,
                    transactionDate: req.clientPaymentDate,
                    payoutDate: req.partnerPayoutDate,
                };
            })
            .sort((a, b) => new Date(b.transactionDate || 0).getTime() - new Date(a.transactionDate || 0).getTime());
    }, [requests, clients, t]);

    const handleCardClick = (
        metricType: 'totalRevenue' | 'totalCommissions' | 'outstandingDues' | 'totalPayouts' | 'pendingClientPayments' | 'failedTransactions' | 'totalTransactions',
        title: string
    ) => {
        let items: { id: string; name: string; amount: number }[] = [];
        let total = 0;

        switch (metricType) {
            case 'totalRevenue':
                const revenueItems = financialData.filter(item => item.platformProfit > 0);
                items = revenueItems.map(item => ({ id: item.requestId, name: `${item.clientName} / ${item.partnerName}`, amount: item.totalAmount }));
                total = financialMetrics.totalRevenue;
                break;
            case 'totalCommissions':
                const commissionItems = financialData.filter(item => item.platformProfit > 0);
                items = commissionItems.map(item => ({ id: item.requestId, name: `${item.clientName} / ${item.partnerName}`, amount: item.platformProfit }));
                total = financialMetrics.totalProfit;
                break;
            case 'outstandingDues':
                const dueItems = financialData.filter(item => item.paymentStatus === 'Due for Payout');
                items = dueItems.map(item => ({ id: item.requestId, name: item.partnerName, amount: item.payoutAmount }));
                total = financialMetrics.pendingPayouts;
                break;
            case 'totalPayouts':
                const releasedItems = financialData.filter(item => item.paymentStatus === 'Payment Released');
                items = releasedItems.map(item => ({ id: item.requestId, name: item.partnerName, amount: item.payoutAmount }));
                total = financialMetrics.totalPayoutsMade;
                break;
            case 'pendingClientPayments':
                const pendingItems = financialData.filter(item => item.paymentStatus === 'Pending Client Payment');
                items = pendingItems.map(item => ({ id: item.requestId, name: item.clientName, amount: item.totalAmount }));
                total = financialMetrics.pendingClientPayments;
                break;
            case 'failedTransactions':
                const failedItems = financialData.filter(item => item.paymentStatus === 'Payment Failed');
                 items = failedItems.map(item => ({ id: item.requestId, name: item.clientName, amount: item.totalAmount }));
                total = failedItems.reduce((sum, item) => sum + item.totalAmount, 0);
                break;
            case 'totalTransactions':
                items = financialData.map(item => ({ id: item.requestId, name: `${item.clientName} / ${item.partnerName}`, amount: item.totalAmount }));
                total = financialData.reduce((sum, item) => sum + item.totalAmount, 0);
                break;
        }

        if (items.length > 0) {
            setModalContent({ title, items, total });
        }
    };
    
    const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const rate = parseFloat(value);
        if (!isNaN(rate) && rate >= 0 && rate <= 100) {
            setPlatformCommissionRate(rate / 100);
        } else if (value === '') {
            setPlatformCommissionRate(0);
        }
    };

    const handleExportCSV = () => {
        // CSV export logic
    };

    const getStatusTag = (status: typeof financialData[0]['paymentStatus']): React.ReactElement => {
        const key = `financialsDashboard.status.${status.replace(/ /g, '')}`;
        switch(status) {
            case 'Pending Client Payment': return <Tag color="blue">{t(key)}</Tag>;
            case 'Payment Failed': return <Tag color="red">{t(key)}</Tag>;
            case 'Due for Payout': return <Tag color="yellow">{t(key)}</Tag>;
            case 'Processing': return <Tag color="blue">{t(key)}</Tag>;
            case 'Payment Released': return <Tag color="green">{t(key)}</Tag>;
            default: return <Tag color="yellow">{t('financialsDashboard.status.Unknown')}</Tag>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h3 className="text-2xl font-black text-white">{t('financialsDashboard.title')}</h3>
            
            <div className="space-y-10">
                <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t('financialsDashboard.sections.revenue')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <KpiCard title={t('dashboard.totalRevenue')} value={`${financialMetrics.totalRevenue.toLocaleString(language)} ${t('global.sar')}`} icon={<BanknotesIcon />} color="purple" onClick={() => handleCardClick('totalRevenue', t('dashboard.totalRevenue'))} />
                        <KpiCard title={t('financialsDashboard.totalCommissions')} value={`${Math.round(financialMetrics.totalProfit).toLocaleString(language)} ${t('global.sar')}`} icon={<RialSignIcon />} color="green" onClick={() => handleCardClick('totalCommissions', t('financialsDashboard.totalCommissions'))}/>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t('financialsDashboard.sections.payouts')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <KpiCard title={t('financialsDashboard.outstandingDues')} value={`${Math.round(financialMetrics.pendingPayouts).toLocaleString(language)} ${t('global.sar')}`} icon={<ClockIcon />} color="yellow" onClick={() => handleCardClick('outstandingDues', t('financialsDashboard.outstandingDues'))}/>
                        <KpiCard title={t('financialsDashboard.totalPartnerPayouts')} value={`${Math.round(financialMetrics.totalPayoutsMade).toLocaleString(language)} ${t('global.sar')}`} icon={<CheckCircleIcon />} color="blue" onClick={() => handleCardClick('totalPayouts', t('financialsDashboard.totalPartnerPayouts'))}/>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t('financialsDashboard.sections.operations')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KpiCard title={t('financialsDashboard.pendingClientPayments')} value={`${Math.round(financialMetrics.pendingClientPayments).toLocaleString(language)} ${t('global.sar')}`} icon={<BanknotesIcon />} color="blue" onClick={() => handleCardClick('pendingClientPayments', t('financialsDashboard.pendingClientPayments'))}/>
                        <KpiCard title={t('financialsDashboard.failedTransactions')} value={financialMetrics.failedTransactions} icon={<XCircleIcon />} color="red" onClick={() => handleCardClick('failedTransactions', t('financialsDashboard.failedTransactions'))}/>
                        <KpiCard title={t('financialsDashboard.totalTransactions')} value={financialMetrics.totalTransactions} icon={<CheckCircleIcon />} color="blue" onClick={() => handleCardClick('totalTransactions', t('financialsDashboard.totalTransactions'))}/>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="p-6 h-full">
                    <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs">{t('financialsDashboard.commissionSettings')}</h4>
                    <div className="space-y-4">
                        <label htmlFor="commissionRate" className="block text-sm font-bold text-slate-400">{t('financialsDashboard.commissionRate')}</label>
                        <div className="relative"><input type="number" id="commissionRate" value={(platformCommissionRate * 100).toFixed(1)} onChange={handleCommissionChange} min="0" max="100" step="0.1" className="form-input !py-4 font-black text-xl text-primary ps-10" /><div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 rtl:ps-0 rtl:pr-4 flex items-center pointer-events-none"><span className="text-primary font-black text-lg">%</span></div></div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">{t('financialsDashboard.note')}</p>
                    </div>
                </Card>

              <Card className="lg:col-span-3 p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                      <h4 className="font-black text-white tracking-tight">{t('financialsDashboard.transactionHistory')}</h4>
                      <Button onClick={handleExportCSV} variant="secondary" className="!py-2 !px-4 !text-sm w-full sm:w-auto" disabled={financialData.length === 0}>{t('financialsDashboard.exportCSV')}</Button>
                  </div>
                    <div className="space-y-4">
                      {financialData.length > 0 ? (
                          financialData.map(item => (
                              <Card key={item.requestId} className={`p-4 sm:p-5 transition-all !rounded-2xl ${item.paymentStatus === 'Payment Failed' ? '!border-red-500/30' : '!border-slate-800'}`}>
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-4 mb-4">
                                      <div>
                                          <span className="font-mono text-[10px] text-slate-500 uppercase">#{item.requestId.split('-')[1]}</span>
                                          <h5 className="font-bold text-white leading-tight">{item.partnerName} <span className="text-slate-500 font-normal mx-1">/</span> {item.clientName}</h5>
                                      </div>
                                      <div className="text-right mt-2 sm:mt-0">
                                          <p className="text-xl font-black text-white">{item.totalAmount.toLocaleString(language)} {t('global.sar')}</p>
                                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{t('financialsDashboard.table.amount')}</span>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 items-start">
                                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('financialsDashboard.table.platformProfit')}</label><p className="font-bold text-primary">{item.platformProfit > 0 ? `${item.platformProfit.toLocaleString(language)} ${t('global.sar')}` : '-'}</p></div>
                                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('financialsDashboard.table.payoutAmount')}</label><p className="font-bold text-blue-400">{item.payoutAmount > 0 ? `${item.payoutAmount.toLocaleString(language)} ${t('global.sar')}`: '-'}</p></div>
                                      <div className="space-y-1 col-span-2 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('financialsDashboard.table.paymentStatus')}</label><div className="mt-1">{getStatusTag(item.paymentStatus)}</div></div>
                                      <div className="col-span-2 lg:col-span-1 flex lg:justify-end items-center pt-2">
                                          {item.paymentStatus === 'Due for Payout' ? (<Button onClick={() => releasePartnerPayment(item.requestId)} className="!py-2 !px-4 !text-xs !rounded-lg w-full lg:w-auto">{t('financialsDashboard.initiatePayout')}</Button>) : (<div className="w-full text-left lg:text-right text-[10px] font-mono text-slate-500 space-y-1">{item.transactionDate && <div>{t('financialsDashboard.table.clientTxDate')}: {new Date(item.transactionDate).toLocaleDateString(language)}</div>}{item.payoutDate && <div>{t('financialsDashboard.table.partnerTxDate')}: {new Date(item.payoutDate).toLocaleDateString(language)}</div>}</div>)}
                                      </div>
                                  </div>
                              </Card>
                          ))
                      ) : (
                          <div className="text-center py-20 opacity-40 border-2 border-dashed border-slate-800 rounded-2xl"><BanknotesIcon className="mx-auto h-12 w-12 text-slate-700 mb-4" /><p className="text-slate-500 font-bold">{t('financialsDashboard.noTransactions')}</p></div>
                      )}
                  </div>
              </Card>
          </div>
          
          <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} title={`${t('financialsDashboard.modalTitlePrefix')} ${modalContent?.title || ''}`}>
            {modalContent && (
                <div className="space-y-4">
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <ul className="divide-y divide-slate-800">
                            {modalContent.items.map(item => (
                                <li key={item.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm text-white">{item.name}</p>
                                        <p className="text-[10px] font-mono text-slate-500">#{item.id.split('-')[1]}</p>
                                    </div>
                                    <p className="font-mono font-bold text-primary text-base">
                                        {item.amount.toLocaleString(language)} {t('global.sar')}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-2xl flex justify-between items-center font-black">
                        <span className="text-sm uppercase text-slate-300">{t('financialsDashboard.totalLabel')}</span>
                        <span className="text-xl text-white">
                            {modalContent.total.toLocaleString(language, { maximumFractionDigits: 2 })} {t('global.sar')}
                        </span>
                    </div>
                </div>
            )}
        </Modal>
      </div>
  );
};

export default FinancialsDashboard;
