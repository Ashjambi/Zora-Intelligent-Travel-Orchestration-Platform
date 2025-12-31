
import { GoogleGenAI, Type } from "@google/genai";
import { TravelRequest, PartnerOffer, TripFeedItem, ComfortLevel, TripType, Partner, Client, PresentedOffer } from "../types";

const isApiReady = () => process.env.API_KEY && process.env.API_KEY !== 'DEFAULT_API_KEY';

// Helper to get current language from localStorage for AI prompts
const getUILang = () => {
    const stored = localStorage.getItem('zora_preferred_lang');
    return (stored === 'en') ? 'English' : 'Arabic'; // Default to Arabic
};

// Define valid service IDs to constrain AI output
const VALID_SERVICE_IDS = [
    "wantsHotelBooking",
    "wantsAirportTransfer",
    "wantsCarRental",
    "wantsPrivateDriver",
    "wantsActivities",
    "wantsTravelInsurance",
    "wantsVisaProcessing",
    "wantsDomesticTrips",
    "wantsCorporateTravel",
    "wantsVipServices",
    "wantsHoneymoonPackage",
    "wantsDailyPrograms"
];

export async function analyzeTravelPrompt(promptText: string): Promise<any | null> {
    const lang = getUILang();
    const fallbackData = { 
        to: lang === 'Arabic' ? "وجهة عالمية" : "Global Destination", 
        budget: 15000, 
        tripDescription: promptText,
        expertAdvice: lang === 'Arabic' ? "نصيحة زورا: استكشف أماكن الإقامة في وسط المدينة لتوفير وقت التنقل." : "Zora Tip: Explore city center lodging to save commute time.",
        budgetAnalysis: lang === 'Arabic' ? "الميزانية المحددة واقعية وتتماشى مع توقعات السوق." : "The budget is realistic and aligned with market expectations.",
        valueScore: 85,
        detailedItinerary: [
            { day: 1, title: lang === 'Arabic' ? "الوصول" : "Arrival", activities: [{ time: "09:00", description: lang === 'Arabic' ? "استقبال VIP ونقل للفندق." : "VIP Welcome and hotel transfer." }] }
        ],
        suggestedQuestions: lang === 'Arabic' ? ["هل يمكنك اقتراح جواهر خفية؟"] : ["Can you suggest local hidden gems?"],
        recommendedServices: [
            { id: "wantsAirportTransfer", title: lang === 'Arabic' ? "نقل مطار" : "Airport Transfer", reason: "Efficiency", icon: "PlaneIcon" }
        ]
    };

    if (!isApiReady()) {
        return new Promise(resolve => setTimeout(() => resolve(fallbackData), 800));
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are Zora, a travel architect. Analyze this: "${promptText}". 
            STRICT REQUIREMENT: Use ${lang} for all text values.
            IMPORTANT: For 'recommendedServices', only use IDs from this list: ${VALID_SERVICE_IDS.join(', ')}. Do not invent new IDs.
            Return JSON: { 
                "from": "city", "to": "destination", "budget": number, 
                "departureDate": "YYYY-MM-DD", "returnDate": "YYYY-MM-DD", "travelers": number, 
                "expertAdvice": "string in ${lang}", "budgetAnalysis": "string in ${lang}", "valueScore": number,
                "detailedItinerary": [{ "day": number, "title": "string", "activities": [{ "time": "HH:MM", "description": "string" }] }], 
                "suggestedQuestions": ["string in ${lang}"],
                "recommendedServices": [{ "id": "serviceId", "title": "string", "reason": "string", "icon": "IconName" }]
            }`,
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "{}");
        return { ...fallbackData, ...result };
    } catch (e) {
        return fallbackData;
    }
}

export async function chatWithZoraExpert(message: string, history: any[]): Promise<{text: string, sources: any[], nextSuggestions: string[]}> {
    const lang = getUILang();
    if (!isApiReady()) return { text: lang === 'Arabic' ? "أنا زورا، مستشارك الذكي. كيف يمكنني مساعدتك؟" : "I am Zora, your strategic architect. How can I assist?", sources: [], nextSuggestions: [] };

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `You are Zora Expert. Answer STRICTLY in ${lang}. 
    JSON Output: { "text": "string in ${lang}", "sources": [{"title": "string", "url": "string"}], "nextSuggestions": ["string in ${lang}"] }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [...history, { role: 'user', parts: [{ text: message }] }],
            config: { systemInstruction, responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        return { text: "Error connecting to Zora intelligence.", sources: [], nextSuggestions: [] };
    }
}

export async function getTrendingDestinations() {
    const lang = getUILang();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Suggest 4 trending destinations. Use ${lang} for names and descriptions.
            Return JSON: [{ "destination": "name", "description": "tagline", "seed": "oneWordEnglish", "prompt": "search prompt" }]`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
}

export async function generateAIItinerary(request: TravelRequest): Promise<string | null> {
    const lang = getUILang();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Generate a professional travel guide for ${request.to} for ${request.travelers} people. Use ${lang}. Format in Markdown.`,
        });
        return response.text?.trim() || null;
    } catch (e) {
        return null;
    }
}

export async function generateAIRadarAlert(request: TravelRequest): Promise<TravelRequest['aiRadarAlert'] | null> {
    const lang = getUILang();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze this travel request for operational risks. Return ${lang} JSON: { "message": "string in ${lang}", "category": "Financial" | "Operational" | "UrgentFollowUp", "severity": "High" | "Medium" }`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch (e) {
        return null;
    }
}

export async function getAIOfferAdvice(request: TravelRequest): Promise<string | null> {
    const lang = getUILang();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `As Zora Expert, provide strategic bidding advice to an agent for a trip to ${request.to}. Use ${lang}.`,
        });
        return response.text?.trim() || null;
    } catch (e) {
        return null;
    }
}

export async function getAITopOfferSelection(request: TravelRequest, offers: PartnerOffer[]): Promise<PresentedOffer[] | null> {
    const lang = getUILang();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze these travel offers for ${request.to}. Choose top 2. Return JSON with justification in ${lang}.`,
            config: { responseMimeType: "application/json" }
        });
        const selections = JSON.parse(response.text || "[]");
        return selections.map((sel: any) => {
            const originalOffer = offers.find(o => o.id === sel.id);
            if (!originalOffer) return null;
            return { ...originalOffer, ...sel } as PresentedOffer;
        }).filter((o: any): o is PresentedOffer => o !== null);
    } catch (e) {
        return null;
    }
}

export async function getTripFeedUpdates(destination: string, date: string): Promise<TripFeedItem[]> {
    const lang = getUILang();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate 3 live trip feed updates for ${destination} in ${lang} JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return [];
    }
}

export async function generateGrowthInsights(data: any): Promise<any | null> {
    const lang = getUILang();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze this SaaS data and provide growth insights in ${lang} JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch (e) {
        return null;
    }
}
