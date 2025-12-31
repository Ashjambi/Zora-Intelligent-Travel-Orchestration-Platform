
import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', loading = false, ...props }) => {
  const baseClasses = 'relative flex items-center justify-center transition-all duration-500 rounded-xl font-bold uppercase tracking-wider text-[11px] overflow-hidden group';

  const variantClasses = {
    primary: 'bg-primary text-white shadow-[0_0_20px_rgba(255,107,107,0.3)] hover:shadow-[0_0_30px_rgba(255,107,107,0.5)] hover:scale-[1.02] active:scale-95 px-6 py-3.5',
    secondary: 'bg-white/5 border border-white/10 text-slate-200 backdrop-blur-md hover:bg-white/10 hover:border-white/20 px-6 py-3.5',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 px-5 py-2.5',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2'
  };

  return (
    <button 
        className={`${baseClasses} ${variantClasses[variant]} ${className} ${props.disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`} 
        disabled={loading || props.disabled} 
        {...props}
    >
      {/* Shine Effect Animation */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></span>
      
      {loading ? <Spinner className="w-4 h-4 mx-2" /> : children}

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
};

export default Button;
