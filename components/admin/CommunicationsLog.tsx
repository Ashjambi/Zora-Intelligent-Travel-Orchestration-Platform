
import React, { useState } from 'react';
import { SimulatedEmail } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import Card from '../shared/Card';
import Modal from '../shared/Modal';
import { EnvelopeIcon, ArchiveBoxIcon } from '../icons/Icons';
import Tag from '../shared/Tag';

const CommunicationsLog: React.FC = () => {
  const { simulatedEmails } = useAppContext();
  const { t } = useTranslation();
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);

  const sortedEmails = [...simulatedEmails].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  const getRecipientTag = (recipient: 'client' | 'partner') => {
    if (recipient === 'client') {
        return <Tag color="green">{t('admin.tabs.clients')}</Tag>;
    }
    return <Tag color="blue">{t('admin.tabs.partners')}</Tag>
  }

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString(t('global.locale'), {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
  }

  return (
    <>
      <Card className="p-5 animate-fade-in-up">
        <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
          <EnvelopeIcon className="w-6 h-6 text-primary"/>
          {t('communicationsLog.title')}
        </h3>
        {sortedEmails.length > 0 ? (
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-sm text-left rtl:text-right text-slate-400 min-w-[800px]">
              <thead className="text-[10px] font-black uppercase bg-slate-950/60 tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">{t('communicationsLog.table.recipient')}</th>
                  <th scope="col" className="px-6 py-4">{t('communicationsLog.table.email')}</th>
                  <th scope="col" className="px-6 py-4">{t('communicationsLog.table.subject')}</th>
                  <th scope="col" className="px-6 py-4">{t('communicationsLog.table.sentAt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedEmails.map(email => (
                  <tr 
                    key={email.id} 
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <td className="px-6 py-5">{getRecipientTag(email.recipient)}</td>
                    <td className="px-6 py-5 font-bold text-slate-200">{email.recipientAddress}</td>
                    <td className="px-6 py-5 text-slate-400 group-hover:text-primary transition-colors">{email.subject}</td>
                    <td className="px-6 py-5 text-xs font-mono opacity-60 whitespace-nowrap">{formatTimestamp(email.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 opacity-30">
            <ArchiveBoxIcon className="mx-auto h-16 w-16 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest">{t('communicationsLog.noEmails')}</p>
          </div>
        )}
      </Card>
      
      <Modal isOpen={!!selectedEmail} onClose={() => setSelectedEmail(null)} title={selectedEmail?.subject || ''}>
        {selectedEmail && (
          <div className="space-y-6 text-sm animate-fade-in-up">
             <div className="space-y-2 pb-6 border-b border-slate-800">
                <div className="flex gap-4">
                    <span className="font-black text-slate-500 w-20 uppercase text-[10px] tracking-widest">{t('communicationsLog.modal.to')}</span>
                    <span className="text-slate-200 font-bold">{selectedEmail.recipientAddress}</span>
                </div>
                <div className="flex gap-4">
                    <span className="font-black text-slate-500 w-20 uppercase text-[10px] tracking-widest">{t('communicationsLog.modal.sentAt')}</span>
                    <span className="text-slate-400 font-mono">{formatTimestamp(selectedEmail.sentAt)}</span>
                </div>
             </div>
             <div>
                <h4 className="font-black text-slate-500 mb-4 uppercase text-[10px] tracking-[0.25em]">{t('communicationsLog.modal.body')}</h4>
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 whitespace-pre-wrap leading-relaxed text-slate-200 font-medium">
                    {selectedEmail.body}
                </div>
             </div>
             <div className="pt-4 text-center">
                 <Tag color="green">{t('communicationsLog.successMessage')}</Tag>
             </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CommunicationsLog;
