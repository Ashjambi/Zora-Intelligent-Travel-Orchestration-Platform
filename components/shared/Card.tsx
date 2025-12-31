
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, id }) => {
  return (
    <div 
        id={id}
        className={`glass-card ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
        onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
