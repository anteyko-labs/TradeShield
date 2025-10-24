import { useState, useEffect } from 'react';
import { getTokenPrices, getTradingPairs, subscribeToPriceUpdates, getHistoricalData } from '../services/priceService';
import { TokenPrice, TradingPair } from '../services/priceService';

export const useRealData = () => {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [prices, pairs] = await Promise.all([
          getTokenPrices(),
          getTradingPairs(),
        ]);
        
        setTokenPrices(prices);
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

    // Subscribe to real-time updates
    const unsubscribe = subscribeToPriceUpdates((updatedPrices) => {
      setTokenPrices(updatedPrices);
      
      // Update trading pairs with new prices
      setTradingPairs(prevPairs => 
        prevPairs.map(pair => {
          const tokenPrice = updatedPrices.find(p => p.symbol === pair.base);
          if (tokenPrice) {
            return {
              ...pair,
              price: tokenPrice.price,
              change: tokenPrice.change24h,
            };
          }
          return pair;
        })
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getTokenPrice = (symbol: string): number => {
    const token = tokenPrices.find(t => t.symbol === symbol);
    return token ? token.price : 0;
  };

  const getTokenChange = (symbol: string): number => {
    const token = tokenPrices.find(t => t.symbol === symbol);
    return token ? token.change24h : 0;
  };

  const getTradingPair = (id: string): TradingPair | undefined => {
    return tradingPairs.find(pair => pair.id === id);
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

export const useHistoricalData = (symbol: string, timeframe: '1h' | '4h' | '1d' = '1h') => {
  const [data, setData] = useState<Array<{ timestamp: number; price: number; volume: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const historicalData = await getHistoricalData(symbol, timeframe);
        setData(historicalData);
      } catch (err) {
        console.error('Error fetching historical data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe]);

  return { data, loading };
};
