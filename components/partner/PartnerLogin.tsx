
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../shared/Card';
import { useTranslation } from '../../context/LanguageContext';
import Button from '../shared/Button';

interface PartnerLoginProps {
  onPartnerLogin: (partnerId: string) => void;
}

const PartnerLogin: React.FC<PartnerLoginProps> = ({ onPartnerLogin }) => {
  const { partners } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [partnerIdInput, setPartnerIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const executeLogin = (partnerId: string) => {
    onPartnerLogin(partnerId);
    // نقوم بالتوجيه بعد تحديث الحالة لضمان سلاسة الانتقال
    setTimeout(() => {
        navigate(`/partner/${partnerId}`);
    }, 10);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const partner = partners.find(p => 
        p.id.toLowerCase() === partnerIdInput.toLowerCase().trim() && 
        p.status === 'Active'
    );

    // محاكاة التحقق: يقبل كلمة مرور "123456" للتجربة
    if (partner && passwordInput === '123456') {
      executeLogin(partner.id);
    } else {
      setError(t('partnerLogin.invalidCredentials'));
    }
  };

  const handleQuickDemoLogin = (id: string) => {
      setPartnerIdInput(id);
      setPasswordInput('123456');
      executeLogin(id);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Section */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2070&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-0" />
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight mb-4 drop-shadow-2xl">
            {t('partnerLogin.title')}
          </h1>
          <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-[300px] mx-auto opacity-80">
            {t('partnerLogin.subtitle')}
          </p>
        </div>
        
        <Card className="!bg-slate-900/70 border-white/10 p-8 sm:p-10 shadow-2xl backdrop-blur-3xl rounded-[2.5rem]">
          <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                  <label htmlFor="partnerId" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                      {t('partnerLogin.partnerIdLabel')}
                  </label>
                  <input
                      id="partnerId"
                      type="text"
                      value={partnerIdInput}
                      onChange={(e) => setPartnerIdInput(e.target.value)}
                      placeholder={t('partnerLogin.partnerIdPlaceholder')}
                      className="form-input w-full !bg-slate-950/60 !border-white/5 focus:!border-primary/50 text-center font-black text-white"
                      required
                      autoFocus
                  />
              </div>

              <div className="space-y-2">
                  <label htmlFor="password" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                      {t('partnerLogin.passwordLabel')}
                  </label>
                  <input
                      id="password"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder={t('partnerLogin.passwordPlaceholder')}
                      className="form-input w-full !bg-slate-950/60 !border-white/5 focus:!border-primary/50 text-center font-mono"
                      required
                  />
              </div>

              {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-xs text-center font-bold text-red-400 animate-shake">{error}</p>
                  </div>
              )}

              <Button
                type="submit"
                className="w-full !py-4 !text-lg !rounded-2xl shadow-2xl shadow-primary/30"
              >
                {t('partnerLogin.enterPortal')}
              </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] text-center mb-4 opacity-60">
                {t('partnerLogin.demoSubtitle')}
            </p>
            <div className="grid grid-cols-1 gap-2">
                {partners.filter(p => p.status === 'Active').slice(0, 3).map((partner) => (
                    <button
                        key={partner.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(partner.id)}
                        className="w-full p-3 bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-xl transition-all text-[11px] font-black text-slate-400 hover:text-primary text-center"
                    >
                        {partner.name}
                    </button>
                ))}
            </div>
          </div>
        </Card>

        <button 
          type="button"
          onClick={() => navigate('/')}
          className="mt-10 w-full text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-[0.3em] transition-colors"
        >
          {t('header.changeGateway')}
        </button>
      </div>
    </div>
  );
};

export default PartnerLogin;
