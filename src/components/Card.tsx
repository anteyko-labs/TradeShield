import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
  return (
    <div
      className={`
        bg-dark-gray border border-medium-gray rounded-lg p-6 shadow-card
        ${hover ? 'hover:border-blue-primary hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
