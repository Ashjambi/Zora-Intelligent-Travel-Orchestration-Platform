
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon, UsersIcon, BuildingOfficeIcon, ChartBarIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

const GatewaySelector: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const gatewayOptions = [
    {
      path: '/client',
      title: t('gatewaySelector.clientTitle'),
      description: t('gatewaySelector.clientDescription'),
      icon: <UsersIcon className="w-12 h-12 mb-4 text-primary" />,
    },
    {
      path: '/partner-login',
      title: t('gatewaySelector.partnerTitle'),
      description: t('gatewaySelector.partnerDescription'),
      icon: <BuildingOfficeIcon className="w-12 h-12 mb-4 text-primary" />,
    },
    {
      path: '/admin',
      title: t('gatewaySelector.adminTitle'),
      description: t('gatewaySelector.adminDescription'),
      icon: <ChartBarIcon className="w-12 h-12 mb-4 text-primary" />,
    },
  ];

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2070&auto=format&fit=crop"
        alt="Airplane flying above clouds"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-12">
          <LogoIcon className="h-16 w-16 text-primary mx-auto drop-shadow-lg" />
          <h1 className="text-4xl font-bold mt-4 text-white drop-shadow-md">
            {t('gatewaySelector.welcomeTitle')}
          </h1>
          <p className="text-lg text-white/90 mt-2 drop-shadow-md">
            {t('gatewaySelector.welcomeSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {gatewayOptions.map((option) => (
            <div
              key={option.path}
              onClick={() => navigate(option.path)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(option.path); }}
              role="button"
              tabIndex={0}
              className="card-base bg-surface/70 dark:bg-surface/80 backdrop-blur-md card-hover border-transparent hover:border-primary/50 transition-colors duration-300"
              aria-label={`${t('global.goTo')} ${option.title}`}
            >
              <div className="p-8 flex flex-col items-center text-center">
                {option.icon}
                <h2 className="text-2xl font-bold mb-2 text-text-primary">{option.title}</h2>
                <p className="text-text-secondary">
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GatewaySelector;
