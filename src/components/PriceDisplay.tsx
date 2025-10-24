import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
  high24h?: number;
  low24h?: number;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price = 0,
  change = 0,
  changePercent = 0,
  volume,
  high24h,
  low24h,
  className = ''
}) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-profit' : 'text-red-loss';
  const bgColor = isPositive ? 'bg-green-profit/10' : 'bg-red-loss/10';
  const icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Price */}
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold text-white">
          ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${bgColor}`}>
          {React.createElement(icon, { className: `w-4 h-4 ${changeColor}` })}
          <span className={`font-semibold ${changeColor}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Change and Volume */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">24h Change:</span>
          <span className={`font-semibold ${changeColor}`}>
            {isPositive ? '+' : ''}${change.toFixed(2)}
          </span>
        </div>
        {volume && (
          <div className="flex items-center gap-2">
            <span className="text-text-muted">24h Volume:</span>
            <span className="font-semibold text-white">{volume}</span>
          </div>
        )}
      </div>

      {/* High/Low */}
      {(high24h || low24h) && (
        <div className="grid grid-cols-2 gap-4">
          {high24h && (
            <div className="bg-medium-gray rounded-lg p-3">
              <div className="text-xs text-text-muted mb-1">24h High</div>
              <div className="font-mono text-green-profit font-semibold">
                ${high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}
          {low24h && (
            <div className="bg-medium-gray rounded-lg p-3">
              <div className="text-xs text-text-muted mb-1">24h Low</div>
              <div className="font-mono text-red-loss font-semibold">
                ${low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};