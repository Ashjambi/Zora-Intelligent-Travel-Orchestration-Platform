
import React, { useState, useRef, useEffect } from 'react';
import Modal from '../shared/Modal';
import { TravelRequest, TravelDay } from '../../types';
import { BotIcon, CheckBadgeIcon, ChartBarIcon, LightBulbIcon, CalendarIcon, SendIcon, GlobeAltIcon, SparklesIcon, ClockIcon } from '../icons/Icons';
import { chatWithZoraExpert } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import Tag from '../shared/Tag';
import Spinner from '../shared/Spinner';
import Card from '../shared/Card';

interface ConsultationChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: TravelRequest;
}

const ConsultationChatModal: React.FC<ConsultationChatModalProps> = ({ isOpen, onClose, request }) => {
    const { addChatMessage } = useAppContext();
    const { t, language } = useTranslation();
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [request.expertChatHistory, isChatLoading]);

    const handleSendMessage = async (msg?: string) => {
        const textToSend = msg || chatInput;
        if (!textToSend.trim() || isChatLoading) return;

        const userMsg = { role: 'user', parts: [{ text: textToSend }] };
        addChatMessage(request.id, 'expert', userMsg);
        setChatInput('');
        setIsChatLoading(true);

        // Fix: Removed the extra language argument as chatWithZoraExpert only accepts message and history
        const response = await chatWithZoraExpert(textToSend, request.expertChatHistory || []);
        setIsChatLoading(false);
        
        const modelMsg = { 
            role: 'model', 
            parts: [{ text: response.text }], 
            sources: response.sources,
            nextSuggestions: response.nextSuggestions 
        };
        addChatMessage(request.id, 'expert', modelMsg);
    };

    if (!request.expertAnalysis) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('consultationChatModal.title')}>
            <div className="space-y-8 min-h-[80vh] flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-5 bg-slate-900 border-slate-800">
                        <div className="flex items-center gap-3 mb-4"><ChartBarIcon className="w-4 h-4 text-primary" /><span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{t('consultationChatModal.planEvaluation')}</span></div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="text-3xl font-black text-white">{request.expertAnalysis.valueScore}%</div>
                             <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary" style={{ width: `${request.expertAnalysis.valueScore}%` }}></div>
                             </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">{request.expertAnalysis.budgetAnalysis}</p>
                    </Card>
                    
                    <Card className="p-5 bg-slate-900 border-slate-800 max-h-[180px] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-3 mb-4"><CalendarIcon className="w-4 h-4 text-green-400" /><span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{t('consultationChatModal.itinerarySummary')}</span></div>
                        <div className="space-y-3">
                            {request.expertAnalysis.detailedItinerary?.map((day: TravelDay, i: number) => (
                                <div key={i} className="border-b border-white/5 pb-2 last:border-0">
                                    <h5 className="text-[10px] font-black text-white uppercase">{t('itinerary.day', {day: day.day})}: {day.title}</h5>
                                    <p className="text-[9px] text-slate-500 truncate">{day.activities?.map(a => a.description).join(' • ')}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="flex-1 flex flex-col bg-slate-950/50 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[400px] custom-scrollbar">
                        {request.expertChatHistory?.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}`}>
                                        {msg.parts[0].text}
                                    </div>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {msg.sources.map((s: any, idx: number) => (
                                                <a key={idx} href={s.url} target="_blank" className="flex items-center gap-1 text-[9px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                                                    <GlobeAltIcon className="w-3 h-3" /> {s.title}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isChatLoading && <div className="flex justify-start animate-pulse"><div className="bg-slate-800 p-4 rounded-2xl"><Spinner className="w-4 h-4" /></div></div>}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
                            {(request.expertChatHistory?.[request.expertChatHistory.length - 1]?.nextSuggestions || request.expertAnalysis.suggestedQuestions)?.map((q: string, i: number) => (
                                <button key={i} onClick={() => handleSendMessage(q)} className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-primary/10 border border-white/10 rounded-full text-[9px] font-black text-slate-400 transition-all whitespace-nowrap">
                                    {q}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-white/10">
                            <input 
                                value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={t('consultationChatModal.chatPlaceholder')}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white px-3 h-10"
                            />
                            <button onClick={() => handleSendMessage()} disabled={isChatLoading} className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg transition-transform active:scale-95">
                                <SendIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ConsultationChatModal;
