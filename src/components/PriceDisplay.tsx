import React from 'react';

interface PriceDisplayProps {
  price: string | number;
  change?: number;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, change, className = '' }) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-mono font-semibold ${
        isPositive ? 'text-green-profit' : isNegative ? 'text-red-loss' : 'text-white'
      }`}>
        ${typeof price === 'number' ? price.toLocaleString() : price}
      </span>
      {change !== undefined && (
        <span className={`text-sm font-medium ${isPositive ? 'text-green-profit' : 'text-red-loss'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      )}
    </div>
  );
};
