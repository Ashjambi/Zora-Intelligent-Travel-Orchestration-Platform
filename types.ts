
export enum ComfortLevel {
    Economy = 'Economy',
    Comfort = 'Comfort',
    Luxury = 'Luxury'
}

export enum TripType {
    OneWay = 'OneWay',
    RoundTrip = 'RoundTrip',
    MultiCity = 'MultiCity'
}

export interface ChatMessage {
    id: string;
    sender: 'Client' | 'Partner' | 'Admin' | string;
    text: string;
    timestamp: string;
}

export interface TravelDay {
    day: number;
    title: string;
    activities: {
        time: string;
        description: string;
    }[];
}

export interface PartnerOffer { 
    id: string; 
    partnerName: string; 
    partnerRating: number; 
    price: number; 
    details: string; 
    cancellationPolicy: string; 
    responseTime: number; 
    isRejected?: boolean; 
    wasRevised?: boolean; 
    revisionNote?: string;
    itinerary?: TravelDay[];
}

export interface PresentedOffer extends PartnerOffer { 
    justification: string; 
    category: string; 
    isRecommended: boolean; 
}

export interface TravelRequest {
    id: string;
    createdAt: string;
    updatedAt: string;
    clientId: string;
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string | null;
    travelers: number;
    tripType: TripType;
    comfortLevel: ComfortLevel;
    budget: number;
    tripDescription?: string;
    preferredHotel?: string;
    status: 'new_request' | 'pending_bids' | 'revision_requested' | 'analyzing' | 'offer_ready' | 'pending_payment' | 'confirmed' | 'payout_processing' | 'payment_released' | 'completed' | 'payment_failed';
    
    expertAnalysis?: {
        expertAdvice: string;
        budgetAnalysis: string;
        valueScore: number;
        itineraryPreview: string[];
        detailedItinerary?: TravelDay[]; 
        suggestedQuestions: string[];
        suggestedModifications?: string;
        recommendedServices: { id: string, title: string, reason: string, icon: string }[];
    };
    expertChatHistory?: any[]; 
    aiGeneratedItinerary?: string;
    aiRadarAlert?: {
        message: string;
        category: 'Financial' | 'Operational' | 'UrgentFollowUp';
        severity: 'High' | 'Medium' | 'Low';
    };

    originatingPartnerId?: string;
    rejectionReason?: string;
    adminRevisionNote?: string;
    
    offers: PartnerOffer[];
    presentedOffers: PresentedOffer[] | null;
    finalOffer: PartnerOffer | null;
    
    chatHistory: ChatMessage[];
    partnerChatHistory: ChatMessage[];
    supportMessages: SupportMessage[];
    
    itinerary?: string;
    tripFeed?: TripFeedItem[];
    
    clientPaymentDate: string | null;
    partnerPayoutDate: string | null;

    finalPriceAtPayment?: number | null;
    commissionAtPayment?: number | null;
    payoutAmountAtPayment?: number | null;

    additionalServices?: {
        wantsHotelBooking?: boolean;
        wantsAirportTransfer?: boolean;
        wantsCarRental?: boolean;
        wantsPrivateDriver?: boolean;
        wantsActivities?: boolean;
        wantsTravelInsurance?: boolean;
        wantsVisaProcessing?: boolean;
        wantsDomesticTrips?: boolean;
        wantsCorporateTravel?: boolean;
        wantsVipServices?: boolean;
        wantsHoneymoonPackage?: boolean;
        wantsDailyPrograms?: boolean;
    };
    
    transactionId?: string;
    payoutId?: string;
}

export interface TripFeedItem { id: string; category: string; title: string; description: string; icon: string; timestamp: string; }
export interface AppNotification { id: string; message: string; timestamp: string; isRead: boolean; targetRole: string; requestId?: string; category: string; icon: string; }
export interface Partner { id: string; name: string; rating: number; specialty: string; contactEmail: string; status: string; joinDate: string; contactPerson?: string; phone?: string; address?: string; notes?: string; performanceTier: string; agreementSignedAt?: string | null; agreementVersion?: string; bio?: string; galleryImageUrls?: string[]; websiteUrl?: string; }
export interface Client { id: string; name: string; email: string; phone?: string; joinDate: string; preferredDestinations?: string; travelPreferences?: string; loyaltyTier: string; agreementSignedAt?: string | null; agreementVersion?: string; }
export interface FeaturedOffer { id: string; partnerId: string; partnerName: string; title: string; description: string; imageUrl: string; price: number; tags: string[]; requestDetails: any; }
export interface SimulatedEmail { id: string; recipient: string; recipientAddress: string; subject: string; body: string; sentAt: string; requestId: string; }
export interface SupportMessage { id: string; sender: string; text: string; timestamp: string; }

// FIX: Added financialMetrics to AppContextType to centralize calculations.
export interface FinancialMetrics {
    totalRevenue: number;
    totalProfit: number;
    pendingPayouts: number;
    totalPayoutsMade: number;
    pendingClientPayments: number;
    failedTransactions: number;
    totalTransactions: number;
}

export interface AppContextType {
    requests: TravelRequest[];
    partners: Partner[];
    clients: Client[];
    featuredOffers: FeaturedOffer[];
    platformCommissionRate: number;
    simulatedEmails: SimulatedEmail[];
    notifications: AppNotification[];
    legalLedger: any[];
    financialMetrics: FinancialMetrics;
    setPlatformCommissionRate: (rate: number) => void;
    addRequest: (newRequest: Partial<TravelRequest>) => void;
    addOffer: (requestId: string, offer: Omit<PartnerOffer, 'id'>) => void;
    presentOffersToClient: (requestId: string, offers: PresentedOffer[]) => void;
    sendRequestToPartners: (requestId: string) => void;
    selectFinalOffer: (requestId: string, offerId: string) => void;
    rejectOffers: (requestId: string, reason: string) => void;
    processClientPayment: (requestId: string) => void;
    acknowledgeFeaturedOfferRequest: (requestId: string, justification: string, category: string) => void;
    releasePartnerPayment: (requestId: string) => void;
    completeTrip: (requestId: string) => void;
    updateRequestStatus: (requestId: string, status: TravelRequest['status']) => void;
    addChatMessage: (requestId: string, chatType: 'client' | 'partner' | 'expert', message: any) => void;
    updateRequestWithAiPlan: (requestId: string, plan: string) => void;
    updatePartner: (updatedPartner: Partner) => void;
    addPartner: (newPartnerData: Omit<Partner, 'id' | 'joinDate'>) => Partner;
    deletePartner: (partnerId: string) => void;
    updateClient: (updatedClient: Client) => void;
    addClient: (newClientData: Omit<Client, 'id' | 'joinDate' | 'loyaltyTier'>) => Client;
    deleteClient: (clientId: string) => void;
    addFeaturedOffer: (offer: Omit<FeaturedOffer, 'id' | 'partnerId' | 'partnerName'>, partnerId: string) => void;
    updateFeaturedOffer: (offer: FeaturedOffer) => void;
    deleteFeaturedOffer: (offerId: string) => void;
    markNotificationsAsRead: (role: 'Client' | 'Partner' | 'Admin') => void;
}
