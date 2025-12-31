
import React, { useState, useEffect, useRef } from 'react';
import { TravelRequest } from '../../types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';
import * as Icons from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';
import { generateAIItinerary } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';

interface AiPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TravelRequest;
}

// Simple markdown to HTML converter
const markdownToHtml = (text: string) => {
    let html = text
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/# (.*?)\n/g, '<h1 class="text-2xl font-black text-white mb-4">$1</h1>') // H1
        .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold text-slate-200 mt-6 mb-3">$1</h2>') // H2
        .replace(/### (.*?)\n/g, '<h3 class="text-lg font-semibold text-slate-300 mt-4 mb-2">$1</h3>') // H3
        .replace(/^\s*[\-\*] (.*)/gm, '<li class="mb-2 ms-4">$1</li>'); // List items

    // Wrap consecutive li elements in ul
    html = html.replace(/(<li>.*?<\/li>\s*)+/g, (match) => `<ul class="list-disc list-outside ps-5">${match}</ul>`);

    return html.replace(/\n/g, '<br />'); // Newlines for paragraphs
};

const AiPlanModal: React.FC<AiPlanModalProps> = ({ isOpen, onClose, request }) => {
    const { t, language } = useTranslation();
    const { updateRequestWithAiPlan } = useAppContext();
    const [planContent, setPlanContent] = useState<string | null>(request.aiGeneratedItinerary || null);
    const [isLoading, setIsLoading] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !planContent) {
            const fetchPlan = async () => {
                setIsLoading(true);
                // Fix: Removed the extra language argument as generateAIItinerary only accepts request
                const content = await generateAIItinerary(request);
                if (content) {
                    setPlanContent(content);
                    updateRequestWithAiPlan(request.id, content);
                }
                setIsLoading(false);
            };
            fetchPlan();
        }
    }, [isOpen, planContent, request, language, updateRequestWithAiPlan]);

    const handlePrint = () => {
        window.print();
    };

    const formattedContent = planContent ? { __html: markdownToHtml(planContent) } : { __html: '' };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={t('aiPlanModal.title')} size="xl">
                <div id="ai-plan-printable-area" ref={printableRef}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                            <Spinner className="w-16 h-16 text-primary mb-6" />
                            <h3 className="text-xl font-black text-white">{t('aiPlanModal.generating')}</h3>
                            <p className="text-slate-400 text-sm max-w-sm mt-2">{t('aiPlanModal.subtitle', { destination: request.to })}</p>
                        </div>
                    ) : (
                        planContent && (
                            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed animate-fade-in-up">
                                <div dangerouslySetInnerHTML={formattedContent} />
                            </div>
                        )
                    )}
                </div>
                {!isLoading && planContent && (
                    <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end" id="no-print">
                        <Button onClick={handlePrint}>
                            {t('aiPlanModal.exportPdf')}
                        </Button>
                    </div>
                )}
            </Modal>
            <style>{`
                .prose strong { color: white; }
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #ai-plan-printable-area, #ai-plan-printable-area * {
                    visibility: visible;
                  }
                  #no-print {
                    visibility: hidden;
                  }
                  #ai-plan-printable-area {
                    position: absolute;
                    left: 20px;
                    top: 20px;
                    right: 20px;
                    width: auto;
                    color: black !important;
                  }
                  #ai-plan-printable-area h1, #ai-plan-printable-area h2, #ai-plan-printable-area h3, #ai-plan-printable-area strong, #ai-plan-printable-area li {
                     color: black !important;
                  }
                  #ai-plan-printable-area ul {
                      list-style-position: inside;
                  }
                }
            `}</style>
        </>
    );
};

export default AiPlanModal;
