
import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ClientGateway from './components/client/ClientGateway';
import PartnerGateway from './components/partner/PartnerGateway';
import AdminGateway from './components/admin/AdminGateway';
import * as Icons from './components/icons/Icons';
import { AppProvider } from './context/AppContext';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import PartnerLogin from './components/partner/PartnerLogin';
import ClientAuth from './components/client/ClientAuth';
import Modal from './components/shared/Modal';
import Button from './components/shared/Button';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </LanguageProvider>
  );
};

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [activeClientId, setActiveClientId] = React.useState<string | null>(() => localStorage.getItem('orchestrator_client_session'));
  const [activePartnerId, setActivePartnerId] = React.useState<string | null>(() => localStorage.getItem('orchestrator_partner_session'));
  
  const handleAuthSuccess = (clientId: string) => {
      localStorage.setItem('orchestrator_client_session', clientId);
      setActiveClientId(clientId);
      setIsAuthModalOpen(false);
  };
  
  const handleLogout = () => {
      localStorage.removeItem('orchestrator_client_session');
      setActiveClientId(null);
      navigate('/');
  };

  const handlePartnerLogout = () => {
      localStorage.removeItem('orchestrator_partner_session');
      setActivePartnerId(null);
      navigate('/partner-login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col text-slate-200 selection:bg-primary/30">
      {/* Strategic Glass Floating Header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-screen-2xl">
        <header className="glass-card !bg-slate-900/60 !rounded-2xl !border-white/10 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <Icons.LogoIcon className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(255,107,107,0.5)] transition-transform group-hover:rotate-12" />
            <h1 className="text-xl font-black tracking-tighter text-white hidden sm:block">{t('header.mainTitle')}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all text-slate-300"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>

            {activeClientId ? (
                <Button onClick={handleLogout} variant="danger" className="!py-1.5 !px-4 !rounded-lg !text-[10px]">
                  {t('header.logout')}
                </Button>
            ) : activePartnerId ? (
               <Button onClick={handlePartnerLogout} variant="danger" className="!py-1.5 !px-4 !rounded-lg !text-[10px]">
                  {t('header.logout')}
                </Button>
            ) : (
                <Button onClick={() => setIsAuthModalOpen(true)} className="!py-1.5 !px-4 !rounded-lg !text-[10px]">
                  {t('header.login')}
                </Button>
            )}
          </div>
        </header>
      </div>

      <main className="flex-grow pt-32">
        <Routes>
          <Route path="/" element={<ClientGateway activeClientId={activeClientId} onAuthRequired={() => setIsAuthModalOpen(true)} onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/partner-login" element={<PartnerLogin onPartnerLogin={(id) => { localStorage.setItem('orchestrator_partner_session', id); setActivePartnerId(id); }} />} />
          <Route path="/partner/:partnerId" element={<PartnerGateway activePartnerId={activePartnerId} />} />
          <Route path="/admin" element={<AdminGateway />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-transparent border-t border-white/5 pt-20 pb-10">
          <div className="max-w-screen-2xl mx-auto px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-start">
                  <div className="col-span-1">
                      <div className="flex items-center gap-3 mb-6">
                        <Icons.LogoIcon className="h-8 w-8 text-primary" />
                        <span className="text-xl font-black text-white tracking-tighter">Zora™</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">{t('footer.description')}</p>
                  </div>
                  <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('footer.solutions')}</h4>
                      <ul className="text-slate-500 text-xs space-y-2">
                          <li className="hover:text-primary transition-colors cursor-pointer">{t('footer.linkLogistics')}</li>
                          <li className="hover:text-primary transition-colors cursor-pointer">{t('footer.linkGovernance')}</li>
                      </ul>
                  </div>
                  <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('footer.trust')}</h4>
                      <div className="flex flex-col gap-2 text-slate-500 text-xs">
                          <span className="flex items-center gap-2"><Icons.ShieldIcon className="w-3 h-3" /> {t('footer.secure')}</span>
                          <span className="flex items-center gap-2"><Icons.BotIcon className="w-3 h-3" /> {t('footer.ai')}</span>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('footer.professionals')}</h4>
                      <div className="flex flex-col gap-3">
                          <button onClick={() => navigate('/partner-login')} className="text-primary text-[10px] font-black hover:underline text-start">{t('footer.joinAsAgent')}</button>
                          <button onClick={() => navigate('/admin')} className="text-slate-600 text-[10px] font-black hover:text-slate-400 text-start">{t('footer.adminAccess')}</button>
                      </div>
                  </div>
              </div>
              <div className="pt-8 border-t border-white/5 text-center text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em]">
                  {t('footer.rights')}
              </div>
          </div>
      </footer>

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} title="">
          <ClientAuth onAuthenticated={handleAuthSuccess} />
      </Modal>
    </div>
  );
};

export default App;
