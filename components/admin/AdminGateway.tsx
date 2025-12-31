
import React, { useState, useMemo } from 'react';
import { TravelRequest, Partner, Client } from '../../types';
import RequestDetails from './RequestDetails';
import Card from '../shared/Card';
import { PlaneIcon, BuildingOfficeIcon, PlusCircleIcon, UserGroupIcon, ChartBarIcon, SparklesIcon, BanknotesIcon, ArchiveBoxIcon, EnvelopeIcon, SearchIcon, ClockIcon, ChatBubbleIcon, FunnelIcon, ShieldIcon } from '../icons/Icons';
import PartnerList from './PartnerList';
import Button from '../shared/Button';
import PartnerFormModal from './PartnerFormModal';
import Modal from '../shared/Modal';
import ClientList from './ClientList';
import ClientFormModal from './ClientFormModal';
import Dashboard from './Dashboard';
import { useAppContext } from '../../context/AppContext';
import FinancialsDashboard from './FinancialsDashboard';
import Tag from '../shared/Tag';
import { useTranslation } from '../../context/LanguageContext';
import CommunicationsLog from './CommunicationsLog';
import PartnerPerformance from './PartnerPerformance';
import PartnerProfileModal from './PartnerProfileModal';
import LegalLedgerLog from './LegalLedgerLog';

const AdminGateway: React.FC = () => {
  const { 
    requests, partners, clients, legalLedger,
    updatePartner, addPartner, deletePartner,
    addClient, updateClient, deleteClient,
  } = useAppContext();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | TravelRequest['status'] | 'follow_up'>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'partners' | 'clients' | 'financials' | 'communications' | 'partner_performance' | 'governance'>('dashboard');

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingPartner, setViewingPartner] = useState<Partner | null>(null);

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

  const filteredRequests = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    return requests.filter(r => {
        let matchesStatus = filterStatus === 'all' || r.status === filterStatus;
        if (filterStatus === 'follow_up') {
            const isLate = (new Date().getTime() - new Date(r.updatedAt).getTime()) > 86400000;
            matchesStatus = r.status === 'offer_ready' && isLate;
        }
        
        if (!matchesStatus) return false;

        const client = clients.find(c => c.id === r.clientId);
        
        return (
            r.to.toLowerCase().includes(searchLower) || 
            r.from.toLowerCase().includes(searchLower) || 
            (client && client.name.toLowerCase().includes(searchLower)) ||
            r.id.toLowerCase().includes(searchLower)
        );
    });
  }, [requests, clients, filterStatus, searchQuery]);
  
  const handleNavigateToRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveTab('requests');
  };

  const FilterGroup: React.FC<{
    title: string;
    icon: React.ReactNode;
    filters: ('new_request' | 'pending_bids' | 'offer_ready' | 'follow_up' | 'pending_payment' | 'confirmed' | 'payout_processing' | 'payment_released')[];
  }> = ({ title, icon, filters }) => (
    <div>
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
            {icon} {title}
        </h4>
        <div className="grid grid-cols-2 gap-2">
            {filters.map(value => {
                const count = requests.filter(r => {
                    if (value === 'follow_up') return r.status === 'offer_ready' && (new Date().getTime() - new Date(r.updatedAt).getTime()) > 86400000;
                    return r.status === value;
                }).length;
                return (
                    <button key={value} onClick={() => setFilterStatus(value as any)} className={`px-3 py-2.5 rounded-lg transition-all text-xs flex items-center justify-between ${filterStatus === value ? 'bg-primary text-white font-black' : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700'}`}>
                        <span>{t(`admin.filters.${value}`)}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === value ? 'bg-white/20' : 'bg-slate-700'}`}>{count}</span>
                    </button>
                );
            })}
        </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
        case 'dashboard': return <Dashboard onNavigateToRequest={handleNavigateToRequest} />;
        case 'requests':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="relative group">
                            <input type="text" placeholder={t('admin.searchPlaceholder')} className="form-input !py-4 ps-12 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        </div>
                        
                        <Card className="p-4 bg-slate-900/60 border-slate-800">
                            <div className="space-y-4">
                                <button 
                                    onClick={() => setFilterStatus('all')}
                                    className={`w-full px-4 py-3 rounded-xl transition-all text-sm flex items-center justify-between ${filterStatus === 'all' ? 'bg-primary text-white font-black shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                >
                                    <span>{t('admin.filters.all')}</span>
                                    <span className={`px-2 py-1 text-xs rounded-md ${filterStatus === 'all' ? 'bg-white/20' : 'bg-slate-700'}`}>{requests.length}</span>
                                </button>
                        
                                <FilterGroup
                                    title={t('admin.filters.groups.active')}
                                    icon={<FunnelIcon className="w-3 h-3" />}
                                    filters={['new_request', 'pending_bids', 'offer_ready', 'follow_up']}
                                />
                        
                                <FilterGroup
                                    title={t('admin.filters.groups.financial')}
                                    icon={<BanknotesIcon className="w-4 h-4" />}
                                    filters={['pending_payment', 'confirmed', 'payout_processing', 'payment_released']}
                                />
                            </div>
                        </Card>

                        <div className="space-y-4 lg:max-h-[calc(100vh-500px)] lg:overflow-y-auto custom-scrollbar">
                            {filteredRequests.map(req => {
                                const hasNewClientMessage = (req.chatHistory?.length ?? 0) > 0 && req.chatHistory[req.chatHistory.length - 1].sender !== 'Admin';
                                const hasNewPartnerMessage = (req.partnerChatHistory?.length ?? 0) > 0 && req.partnerChatHistory[req.partnerChatHistory.length - 1].sender !== 'Admin';
                                const needsAttention = hasNewClientMessage || hasNewPartnerMessage;
                                const hasNewOffers = req.status === 'pending_bids' && req.offers.length > 0;

                                return (
                                <Card key={req.id} onClick={() => setSelectedRequestId(req.id)} className={`p-5 border-l-4 transition-all bg-slate-900 ${selectedRequestId === req.id ? '!border-primary scale-[1.02]' : 'border-slate-800'}`}>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                                        <span className="font-black uppercase">{clients.find(c => c.id === req.clientId)?.name || t('global.unknown')}</span>
                                        <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/> {getTimeAgo(req.updatedAt)}</span>
                                    </div>
                                    <div className="font-black text-sm text-white mb-2">{req.from} → {req.to}</div>
                                    <div className="flex items-center gap-3">
                                        <Tag color={req.status === 'offer_ready' ? 'yellow' : 'blue'}>{t(`enums.requestStatus.${req.status}`)}</Tag>
                                        {needsAttention && (
                                            <div className="flex items-center gap-1.5 text-primary animate-pulse">
                                                <ChatBubbleIcon className="w-4 h-4" />
                                                <span className="font-black text-[10px] uppercase tracking-wider">{t('admin.newMessage')}</span>
                                            </div>
                                        )}
                                        {hasNewOffers && (
                                            <div className="flex items-center gap-1.5 text-blue-400 animate-pulse">
                                                <BuildingOfficeIcon className="w-4 h-4" />
                                                <span className="font-black text-[10px] uppercase tracking-wider">{t('admin.newOffers')}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )})}
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        {selectedRequestId ? (
                            <RequestDetails request={requests.find(r => r.id === selectedRequestId)!}/>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30">
                                <PlaneIcon className="w-20 h-20 mb-6" />
                                <p className="font-bold">{t('admin.selectRequest')}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'partners': return <PartnerList onEdit={(p) => { setEditingPartner(p); setIsPartnerModalOpen(true); }} onDelete={(p) => deletePartner(p.id)} onAnalyze={() => {}} onAdd={() => { setEditingPartner(null); setIsPartnerModalOpen(true); }} onViewProfile={(p) => { setViewingPartner(p); setIsProfileModalOpen(true); }} />;
        case 'partner_performance': return <PartnerPerformance />;
        case 'clients': return <ClientList onEdit={(c) => { setEditingClient(c); setIsClientModalOpen(true); }} onDelete={(c) => deleteClient(c.id)} onAnalyze={() => {}} onAdd={() => { setEditingClient(null); setIsClientModalOpen(true); }} />;
        case 'financials': return <FinancialsDashboard />;
        case 'communications': return <CommunicationsLog />;
        case 'governance': return <LegalLedgerLog ledger={legalLedger} />;
        default: return null;
    }
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 sm:p-10">
      <div className="flex justify-center mb-10">
        <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 flex overflow-x-auto scrollbar-hide backdrop-blur-xl">
            {[
                { id: 'dashboard', icon: <ChartBarIcon />, label: t('admin.tabs.dashboard') },
                { id: 'requests', icon: <PlaneIcon />, label: t('admin.tabs.requests') },
                { id: 'partners', icon: <BuildingOfficeIcon />, label: t('admin.tabs.partners') },
                { id: 'partner_performance', icon: <SparklesIcon />, label: t('admin.tabs.partner_performance') },
                { id: 'clients', icon: <UserGroupIcon />, label: t('admin.tabs.clients') },
                { id: 'financials', icon: <BanknotesIcon />, label: t('admin.tabs.financials') },
                { id: 'communications', icon: <EnvelopeIcon />, label: t('admin.tabs.communications') },
                { id: 'governance', icon: <ShieldIcon />, label: t('admin.tabs.governance') }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-3 font-black text-xs rounded-xl transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                    {React.cloneElement(tab.icon as any, { className: 'w-4 h-4' })}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
      </div>
      {renderContent()}

      <PartnerFormModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} onSave={(p) => { if('id' in p) updatePartner(p as Partner); else addPartner(p); setIsPartnerModalOpen(false); }} partner={editingPartner} />
      <ClientFormModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSave={(c) => { if('id' in c) updateClient(c as Client); else addClient(c); setIsClientModalOpen(false); }} client={editingClient} />
      {viewingPartner && <PartnerProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} partner={viewingPartner} />}
    </div>
  );
};

export default AdminGateway;
