import { useState, useEffect } from 'react';
import { priceService, TokenPrice } from '../services/priceService';
import { getRealCryptoPrices } from '../services/realDataService';

export interface TradingPair {
  id: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  high24h: number;
  low24h: number;
}

export const useRealData = () => {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Получаем реальные данные о криптовалютах
        const realPrices = await getRealCryptoPrices();
        
        // Конвертируем в формат TokenPrice
        const prices: TokenPrice[] = realPrices.map(price => ({
          symbol: price.symbol,
          price: price.price,
          change24h: price.changePercent24h,
          volume24h: price.volume24h
        }));
        
        setTokenPrices(prices);
        
        // Создаем торговые пары
        const pairs: TradingPair[] = realPrices.map(price => ({
          id: `${price.symbol}/USDT`,
          name: `${price.symbol}/USDT`,
          price: price.price,
          change: price.changePercent24h,
          volume: formatVolume(price.volume24h),
          high24h: price.high24h,
          low24h: price.low24h
        }));
        
        setTradingPairs(pairs);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Обновляем данные каждые 30 секунд
    const interval = setInterval(async () => {
      try {
        const realPrices = await getRealCryptoPrices();
        
        const prices: TokenPrice[] = realPrices.map(price => ({
          symbol: price.symbol,
          price: price.price,
          change24h: price.changePercent24h,
          volume24h: price.volume24h
        }));
        
        setTokenPrices(prices);
        
        const pairs: TradingPair[] = realPrices.map(price => ({
          id: `${price.symbol}/USDT`,
          name: `${price.symbol}/USDT`,
          price: price.price,
          change: price.changePercent24h,
          volume: formatVolume(price.volume24h),
          high24h: price.high24h,
          low24h: price.low24h
        }));
        
        setTradingPairs(pairs);
      } catch (err) {
        console.error('Error updating data:', err);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    } else {
      return volume.toFixed(0);
    }
  };

  const getTokenPrice = (symbol: string): number => {
    const token = tokenPrices.find(t => t.symbol === symbol);
    return token ? token.price : 0;
  };

  const getTokenChange = (symbol: string): number => {
    const token = tokenPrices.find(t => t.symbol === symbol);
    return token ? token.change24h : 0;
  };

  const getTradingPair = (pairId: string): TradingPair | undefined => {
    return tradingPairs.find(p => p.id === pairId);
  };

  return {
    tokenPrices,
    tradingPairs,
    loading,
    error,
    getTokenPrice,
    getTokenChange,
    getTradingPair,
  };
};