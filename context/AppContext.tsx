
import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect, useMemo, useRef } from 'react';
import { TravelRequest, PartnerOffer, ChatMessage, Partner, Client, PresentedOffer, FeaturedOffer, TripFeedItem, SupportMessage, SimulatedEmail, AppNotification, FinancialMetrics, AppContextType } from '../types';
import { MOCK_REQUESTS, MOCK_PARTNERS, MOCK_CLIENTS, INITIAL_PLATFORM_COMMISSION_RATE, MOCK_FEATURED_OFFERS } from '../constants';

// Helper to create a simulated hash
const simpleHash = (data: any) => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null
            ? JSON.parse(stickyValue)
            : defaultValue;
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useStickyState<TravelRequest[]>(MOCK_REQUESTS.map(r => ({ ...r, updatedAt: r.createdAt })), 'zora_op_requests');
    const [partners, setPartners] = useStickyState<Partner[]>(MOCK_PARTNERS, 'zora_op_partners_v2');
    const [clients, setClients] = useStickyState<Client[]>(MOCK_CLIENTS, 'zora_op_clients');
    const [featuredOffers, setFeaturedOffers] = useStickyState<FeaturedOffer[]>(MOCK_FEATURED_OFFERS, 'zora_op_featured');
    const [platformCommissionRate, setPlatformCommissionRate] = useStickyState<number>(INITIAL_PLATFORM_COMMISSION_RATE, 'zora_op_commission');
    const [simulatedEmails, setSimulatedEmails] = useStickyState<SimulatedEmail[]>([], 'zora_op_emails');
    const [notifications, setNotifications] = useStickyState<AppNotification[]>([], 'zora_op_notifications');
    const [legalLedger, setLegalLedger] = useStickyState<any[]>([], 'zora_legal_ledger');
    const isLedgerInitialized = useRef(false);

    useEffect(() => {
        // Back-fill the legal ledger from mock data if it's empty
        if (!isLedgerInitialized.current && legalLedger.length === 0) {
            const initialLedger: any[] = [];

            MOCK_CLIENTS.forEach(client => {
                if (client.agreementSignedAt) {
                    const details = { clientId: client.id, clientName: client.name, agreementVersion: client.agreementVersion };
                    initialLedger.push({
                        recordId: `REC-${new Date(client.agreementSignedAt).getTime()}-C`,
                        timestamp: client.agreementSignedAt,
                        eventType: 'CLIENT_AGREEMENT_SIGNED',
                        details,
                        hash: simpleHash({ eventType: 'CLIENT_AGREEMENT_SIGNED', details }),
                    });
                }
            });

            MOCK_PARTNERS.forEach(partner => {
                if (partner.agreementSignedAt) {
                    const details = { partnerId: partner.id, partnerName: partner.name, agreementVersion: partner.agreementVersion };
                    initialLedger.push({
                        recordId: `REC-${new Date(partner.agreementSignedAt).getTime()}-P`,
                        timestamp: partner.agreementSignedAt,
                        eventType: 'PARTNER_AGREEMENT_SIGNED',
                        details,
                        hash: simpleHash({ eventType: 'PARTNER_AGREEMENT_SIGNED', details }),
                    });
                }
            });

            MOCK_REQUESTS.forEach(req => {
                if (req.clientPaymentDate && req.finalOffer) {
                    const paymentDetails = { requestId: req.id, clientId: req.clientId, partnerName: req.finalOffer.partnerName, finalPrice: req.finalPriceAtPayment, commission: req.commissionAtPayment, payout: req.payoutAmountAtPayment };
                    initialLedger.push({ recordId: `REC-${new Date(req.clientPaymentDate).getTime()}-PMT`, timestamp: req.clientPaymentDate, eventType: 'BOOKING_CONFIRMED_AND_PAID', details: paymentDetails, hash: simpleHash({ eventType: 'BOOKING_CONFIRMED_AND_PAID', details: paymentDetails }) });
                }
                if (req.partnerPayoutDate) {
                    const payoutDetails = { requestId: req.id, partnerName: req.finalOffer?.partnerName, payoutAmount: req.payoutAmountAtPayment };
                    initialLedger.push({ recordId: `REC-${new Date(req.partnerPayoutDate).getTime()}-PAY`, timestamp: req.partnerPayoutDate, eventType: 'PAYOUT_RELEASED', details: payoutDetails, hash: simpleHash({ eventType: 'PAYOUT_RELEASED', details: payoutDetails }) });
                }
            });

            setLegalLedger(initialLedger);
            isLedgerInitialized.current = true;
        }
    }, [legalLedger, setLegalLedger]);

    useEffect(() => {
        // This effect ensures that the default mock data is always present in localStorage,
        // acting as a simple data migration for users with older cached data.
        
        // For clients
        setClients(currentClients => {
            const clientMap = new Map(currentClients.map(c => [c.id, c]));
            let needsUpdate = false;
            MOCK_CLIENTS.forEach(mockClient => {
                if (!clientMap.has(mockClient.id)) {
                    clientMap.set(mockClient.id, mockClient);
                    needsUpdate = true;
                }
            });
            return needsUpdate ? Array.from(clientMap.values()) : currentClients;
        });

        // For partners
        setPartners(currentPartners => {
            const partnerMap = new Map(currentPartners.map(p => [p.id, p]));
            let needsUpdate = false;
            MOCK_PARTNERS.forEach(mockPartner => {
                if (!partnerMap.has(mockPartner.id)) {
                    partnerMap.set(mockPartner.id, mockPartner);
                    needsUpdate = true;
                }
            });
            return needsUpdate ? Array.from(partnerMap.values()) : currentPartners;
        });
    }, [setClients, setPartners]);


    const logLegalEvent = useCallback((eventType: string, details: object) => {
        const record = { recordId: `REC-${Date.now()}`, timestamp: new Date().toISOString(), eventType, details, hash: simpleHash({ eventType, details }) };
        setLegalLedger(prev => [...prev, record]);
    }, [setLegalLedger]);

    const updateRequestInternal = useCallback((requestId: string, updates: Partial<TravelRequest>) => {
        setRequests(prev => prev.map(req => req.id === requestId ? { ...req, ...updates, updatedAt: new Date().toISOString() } : req));
    }, [setRequests]);

    const addRequest = (newRequest: any) => {
        const now = new Date().toISOString();
        const requestWithId: TravelRequest = { id: `TR-${Date.now()}`, createdAt: now, updatedAt: now, status: 'new_request', offers: [], presentedOffers: null, finalOffer: null, chatHistory: [], partnerChatHistory: [], tripFeed: [], clientPaymentDate: null, partnerPayoutDate: null, supportMessages: [], ...newRequest };
        setRequests(prev => [requestWithId, ...prev]);
    };

    const addChatMessage = (requestId: string, chatType: 'client' | 'partner' | 'expert', message: any) => {
        setRequests(prev => prev.map(req => { if (req.id === requestId) { const now = new Date().toISOString(); if (chatType === 'expert') { return { ...req, expertChatHistory: [...(req.expertChatHistory || []), message], updatedAt: now }; } const newMessage: ChatMessage = { ...message, id: `MSG-${Date.now()}` }; if (chatType === 'client') return { ...req, chatHistory: [...(req.chatHistory || []), newMessage], updatedAt: now }; return { ...req, partnerChatHistory: [...(req.partnerChatHistory || []), newMessage], updatedAt: now }; } return req; }));
    };

    const updatePartner = useCallback((updatedPartner: Partner) => { const originalPartner = partners.find(p => p.id === updatedPartner.id); if (originalPartner && !originalPartner.agreementSignedAt && updatedPartner.agreementSignedAt) { logLegalEvent('PARTNER_AGREEMENT_SIGNED', { partnerId: updatedPartner.id, partnerName: updatedPartner.name, agreementVersion: updatedPartner.agreementVersion }); } setPartners(prev => prev.map(p => p.id === updatedPartner.id ? { ...updatedPartner } : p)); }, [partners, setPartners, logLegalEvent]);
    const addPartner = useCallback((newPartnerData: any): Partner => { const newPartner: Partner = { ...newPartnerData, id: `P-${Date.now()}`, joinDate: new Date().toISOString().split('T')[0] }; setPartners(prev => [...prev, newPartner]); return newPartner; }, [setPartners]);
    const deletePartner = useCallback((partnerId: string) => { setPartners(prev => prev.filter(p => p.id !== partnerId)); }, [setPartners]);
    const updateClient = useCallback((updatedClient: Client) => { setClients(prev => prev.map(c => c.id === updatedClient.id ? { ...updatedClient } : c)); }, [setClients]);
    const addClient = useCallback((newClientData: any): Client => { const newClient: Client = { ...newClientData, id: `C-${Date.now()}`, joinDate: new Date().toISOString().split('T')[0], loyaltyTier: 'Bronze' }; setClients(prev => [...prev, newClient]); if (newClient.agreementSignedAt) { logLegalEvent('CLIENT_AGREEMENT_SIGNED', { clientId: newClient.id, clientName: newClient.name, agreementVersion: newClient.agreementVersion }); } return newClient; }, [setClients, logLegalEvent]);
    const deleteClient = useCallback((clientId: string) => { setClients(prev => prev.filter(c => c.id !== clientId)); }, [setClients]);
    const markNotificationsAsRead = (role: 'Client' | 'Partner' | 'Admin') => { setNotifications(prev => prev.map(n => n.targetRole === role ? { ...n, isRead: true } : n)); };
    const addOffer = (requestId: string, offer: any) => { setRequests(prev => prev.map(r => { if (r.id === requestId) { const existingOfferIndex = r.offers.findIndex(o => o.partnerName === offer.partnerName); let newOffers = [...r.offers]; if (existingOfferIndex >= 0) { newOffers[existingOfferIndex] = { ...offer, id: r.offers[existingOfferIndex].id, isRejected: false, wasRevised: true }; } else { newOffers.push({ ...offer, id: `PO-${Date.now()}`, isRejected: false, wasRevised: false }); } return { ...r, offers: newOffers, status: 'pending_bids', updatedAt: new Date().toISOString() }; } return r; })); };
    const presentOffersToClient = useCallback((requestId: string, offers: PresentedOffer[]) => { updateRequestInternal(requestId, { status: 'offer_ready', presentedOffers: offers }); }, [updateRequestInternal]);
    const sendRequestToPartners = useCallback((requestId: string) => { updateRequestInternal(requestId, { status: 'pending_bids' }); }, [updateRequestInternal]);
    const selectFinalOffer = useCallback((requestId: string, offerId: string) => { setRequests(prev => prev.map(r => (r.id === requestId && r.presentedOffers) ? { ...r, status: 'pending_payment', finalOffer: r.presentedOffers.find(o => o.id === offerId) || null, updatedAt: new Date().toISOString() } : r)); }, [setRequests]);
    const rejectOffers = useCallback((requestId: string, reason: string) => { setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'revision_requested', rejectionReason: reason, presentedOffers: null, updatedAt: new Date().toISOString() } : r)); }, [setRequests]);
    
    const processClientPayment = useCallback((requestId: string) => {
        let paymentDetails: any = {};
        setRequests(prev => {
            const req = prev.find(r => r.id === requestId);
            if (req && req.finalOffer) {
                const finalPrice = req.finalOffer.price;
                const commission = finalPrice * platformCommissionRate;
                const payout = finalPrice - commission;
                paymentDetails = { requestId: req.id, clientId: req.clientId, partnerId: partners.find(p => p.name === req.finalOffer!.partnerName)?.id, finalPrice, commission, payout };
                logLegalEvent('BOOKING_CONFIRMED_AND_PAID', paymentDetails);
                const itineraryString = req.finalOffer.itinerary?.map(day => `Day ${day.day}: ${day.title}. ${day.activities.map(act => act.description).join(' ')}`).join('\n');
                return prev.map(r => r.id === requestId ? { ...r, status: 'confirmed', clientPaymentDate: new Date().toISOString(), finalPriceAtPayment: finalPrice, commissionAtPayment: commission, payoutAmountAtPayment: payout, itinerary: itineraryString } : r);
            }
            return prev;
        });
    }, [setRequests, platformCommissionRate, partners, logLegalEvent]);

    const releasePartnerPayment = useCallback((requestId: string) => { logLegalEvent('PAYOUT_RELEASED', { requestId }); updateRequestInternal(requestId, { status: 'payment_released', partnerPayoutDate: new Date().toISOString() }); }, [updateRequestInternal, logLegalEvent]);
    const updateRequestWithAiPlan = useCallback((requestId: string, plan: string) => { updateRequestInternal(requestId, { aiGeneratedItinerary: plan }); }, [updateRequestInternal]);
    const addFeaturedOffer = useCallback((offerData: any, partnerId: string) => { const partner = partners.find(p => p.id === partnerId); if (!partner) return; const newOffer: FeaturedOffer = { ...offerData, id: `FO-${Date.now()}`, partnerId: partner.id, partnerName: partner.name }; setFeaturedOffers(prev => [newOffer, ...prev]); }, [partners, setFeaturedOffers]);
    const updateFeaturedOffer = useCallback((updatedOffer: FeaturedOffer) => { setFeaturedOffers(prev => prev.map(o => o.id === updatedOffer.id ? updatedOffer : o)); }, [setFeaturedOffers]);
    const deleteFeaturedOffer = useCallback((offerId: string) => { setFeaturedOffers(prev => prev.filter(o => o.id !== offerId)); }, [setFeaturedOffers]);

    // FIX: Centralize all key financial metric calculations.
    const financialMetrics = useMemo((): FinancialMetrics => {
        const paidRequests = requests.filter(r => r.clientPaymentDate);
        const totalRevenue = paidRequests.reduce((sum, req) => sum + (req.finalPriceAtPayment || 0), 0);
        const totalProfit = paidRequests.reduce((sum, req) => sum + (req.commissionAtPayment || 0), 0);
        
        const pendingPayouts = requests.filter(r => r.status === 'confirmed').reduce((sum, req) => sum + (req.payoutAmountAtPayment || 0), 0);
        const totalPayoutsMade = requests.filter(r => r.status === 'payment_released' || r.status === 'completed').reduce((sum, req) => sum + (req.payoutAmountAtPayment || 0), 0);
        const pendingClientPayments = requests.filter(r => r.status === 'pending_payment').reduce((sum, r) => sum + (r.finalOffer?.price || 0), 0);
        const failedTransactions = requests.filter(r => r.status === 'payment_failed').length;
        const totalTransactions = requests.filter(r => ['pending_payment', 'payment_failed', 'confirmed', 'payout_processing', 'payment_released', 'completed'].includes(r.status)).length;

        return { totalRevenue, totalProfit, pendingPayouts, totalPayoutsMade, pendingClientPayments, failedTransactions, totalTransactions };
    }, [requests]);

    const value: AppContextType = {
        requests, partners, clients, featuredOffers, platformCommissionRate, simulatedEmails, notifications, legalLedger, financialMetrics,
        setPlatformCommissionRate, addRequest, addOffer, presentOffersToClient, sendRequestToPartners,
        selectFinalOffer, rejectOffers, processClientPayment, releasePartnerPayment, 
        updateRequestStatus: (id: any, s: any) => updateRequestInternal(id, {status: s}), 
        addChatMessage, updateRequestWithAiPlan, updatePartner, addPartner, deletePartner, updateClient, addClient, deleteClient, addFeaturedOffer, updateFeaturedOffer, deleteFeaturedOffer, 
        markNotificationsAsRead,
        acknowledgeFeaturedOfferRequest: (id: string, j: string, c: string) => { setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'offer_ready', presentedOffers: [{ ...r.offers[0], justification: j, category: c, isRecommended: true }] } : r)); },
        completeTrip: (id: any) => updateRequestInternal(id, {status: 'completed'})
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
