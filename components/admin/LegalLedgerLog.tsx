
import React from 'react';
import Card from '../shared/Card';
import { ShieldIcon, ArchiveBoxIcon, CheckCircleIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';
import Tag from '../shared/Tag';

interface LegalLedgerLogProps {
  ledger: any[];
}

const LegalLedgerLog: React.FC<LegalLedgerLogProps> = ({ ledger }) => {
  const { t } = useTranslation();

  const sortedLedger = [...ledger].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card className="p-5 animate-fade-in-up">
      <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
        <ShieldIcon className="w-6 h-6 text-primary" />
        {t('admin.tabs.governance')}
      </h3>
      <p className="text-sm text-slate-400 mb-8 max-w-2xl">
        {t('legalLedger.description')}
      </p>

      {sortedLedger.length > 0 ? (
        <div className="space-y-4">
          {sortedLedger.map(record => (
            <div key={record.recordId} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl transition-all hover:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-1 border border-green-500/20">
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="font-bold text-white leading-tight">
                                {t(`legalLedger.eventTypes.${record.eventType}`) || record.eventType}
                            </p>
                            <span className="text-[10px] font-mono text-slate-500">
                                {new Date(record.timestamp).toLocaleString(t('global.locale'))}
                            </span>
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <Tag color="blue">
                            {t('legalLedger.recordId')}: {record.recordId}
                        </Tag>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <details>
                        <summary className="text-xs font-bold text-slate-500 cursor-pointer hover:text-white transition-colors uppercase tracking-widest">{t('legalLedger.details')}</summary>
                        <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-[10px] text-slate-400 font-mono overflow-x-auto custom-scrollbar">
                           {JSON.stringify(record.details, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-30 border-2 border-dashed border-slate-800 rounded-2xl">
          <ArchiveBoxIcon className="mx-auto h-16 w-16 mb-4" />
          <p className="text-sm font-black uppercase tracking-widest">{t('legalLedger.noRecords')}</p>
        </div>
      )}
    </Card>
  );
};

export default LegalLedgerLog;
