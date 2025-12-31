
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import Button from './Button';
import Card from './Card';
import { ChatBubbleIcon, SendIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface ChatProps {
  title?: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: string;
  isEmbedded?: boolean;
}

const Chat: React.FC<ChatProps> = ({ title, messages, onSendMessage, currentUser, isEmbedded = false }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
  const chatContent = (
     <div className="flex flex-col h-full">
        {title && !isEmbedded && <h3 className="text-lg font-bold mb-4 flex items-center text-white"><ChatBubbleIcon className="w-5 h-5 mx-3 text-primary"/>{title}</h3>}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40 dark:bg-slate-950/60 rounded-2xl min-h-[300px] border border-slate-800/60 shadow-inner">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender === currentUser || (currentUser === 'Admin' && msg.sender === 'Admin');
            const isAdmin = msg.sender === 'Admin';
            const isClient = msg.sender === 'Client';
            const senderName = msg.sender === 'Admin' ? t('chat.senderAdmin') : msg.sender;
            
            return (
              <div key={msg.id} className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-sm shadow-lg ${isCurrentUser ? 'bg-primary text-white rounded-br-none rtl:rounded-br-2xl rtl:rounded-bl-none' : 'bg-slate-800 text-slate-100 rounded-bl-none rtl:rounded-bl-2xl rtl:rounded-br-none border border-slate-700'}`}>
                     {!isCurrentUser && (
                        <p className={`text-[10px] font-black mb-1.5 uppercase tracking-wider ${isAdmin ? 'text-purple-400' : isClient ? 'text-green-400' : 'text-blue-400'}`}>
                            {senderName}
                        </p>
                     )}
                     <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1.5 px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4">
            <div className="flex items-center p-2 bg-slate-900 border border-slate-700 rounded-2xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-xl">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    className="flex-1 px-3 py-2.5 bg-transparent border-none focus:ring-0 text-sm text-slate-100 w-full placeholder:text-slate-600"
                    aria-label="Message input"
                />
                <Button 
                    type="submit" 
                    className="!py-2 !px-4 !text-xs !rounded-xl shadow-lg"
                    disabled={!newMessage.trim()}
                >
                    {t('chat.send')}
                </Button>
            </div>
        </form>
    </div>
  );

  return isEmbedded ? chatContent : <Card className="p-4 sm:p-5 bg-slate-900/40">{chatContent}</Card>;
};

export default Chat;
