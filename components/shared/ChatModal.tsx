import React from 'react';
import Modal from './Modal';
import Chat from './Chat';
import { ChatMessage } from '../../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, title, messages, onSendMessage, currentUser }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="h-[400px]">
             <Chat 
                messages={messages}
                onSendMessage={onSendMessage}
                currentUser={currentUser}
                isEmbedded={true}
             />
        </div>
    </Modal>
  );
};

export default ChatModal;