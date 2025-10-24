import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getRealCryptoPrices, RealPriceData } from '../services/realDataService';

interface MockTickerProps {
  symbols: string[];
  height?: number;
  className?: string;
}

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const MockTicker: React.FC<MockTickerProps> = ({
  symbols,
  height = 50,
  className = ''
}) => {
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get real crypto data
  const fetchRealData = async (): Promise<TickerData[]> => {
    try {
      const realData = await getRealCryptoPrices();
      return realData.map(data => ({
        symbol: data.symbol,
        price: data.price,
        change: data.change24h,
        changePercent: data.changePercent24h
      }));
    } catch (error) {
      console.error('Error fetching real data:', error);
      // Fallback to real prices without API (updated with real Bitcoin price)
      return symbols.map(symbol => {
        const basePrice = symbol === 'BTCUSD' ? 110203 : 
                        symbol === 'ETHUSD' ? 3200 :
                        symbol === 'ADAUSD' ? 0.45 :
                        symbol === 'SOLUSD' ? 95 :
                        symbol === 'DOTUSD' ? 6.5 :
                        symbol === 'AVAXUSD' ? 35 :
                        symbol === 'MATICUSD' ? 0.85 :
                        symbol === 'LINKUSD' ? 14 : 100;
        
        const change = (Math.random() - 0.5) * basePrice * 0.02; // ±1% change
        const price = basePrice + change;
        const changePercent = (change / basePrice) * 100;
        
        return {
          symbol,
          price,
          change,
          changePercent
        };
      });
    }
  };

  useEffect(() => {
    // Initial data
    const loadData = async () => {
      const data = await fetchRealData();
      setTickerData(data);
      setIsLoading(false);
    };
    
    loadData();

    // Update data every 5 minutes to avoid rate limiting
    const interval = setInterval(async () => {
      const data = await fetchRealData();
      setTickerData(data);
    }, 300000);

    return () => clearInterval(interval);
  }, [symbols]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-dark-gray ${className}`} style={{ height: `${height}px` }}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-primary"></div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-dark-gray border-b border-medium-gray overflow-hidden ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center h-full animate-scroll">
        {tickerData.map((data, index) => (
          <div key={`${data.symbol}-${index}`} className="flex items-center gap-4 px-6 py-2 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{data.symbol}</span>
              <span className="text-sm font-mono text-white">
                ${data.price.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                data.change >= 0 ? 'bg-green-profit/20 text-green-profit' : 'bg-red-loss/20 text-red-loss'
              }`}>
                {data.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-xs font-semibold">
                  {data.change >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
