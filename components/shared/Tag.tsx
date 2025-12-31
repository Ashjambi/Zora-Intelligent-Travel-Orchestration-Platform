
import React from 'react';

interface TagProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const Tag: React.FC<TagProps> = ({ children, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
        green: 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]',
        yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]',
        red: 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
        purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md border backdrop-blur-md ${colorClasses[color]}`}>
      <span className={`w-1 h-1 rounded-full me-1.5 ${
        color === 'blue' ? 'bg-blue-400' : 
        color === 'green' ? 'bg-green-400' : 
        color === 'yellow' ? 'bg-yellow-400' : 
        color === 'red' ? 'bg-red-400' : 'bg-purple-400'
      } animate-pulse`}></span>
      {children}
    </span>
  );
};

export default Tag;
