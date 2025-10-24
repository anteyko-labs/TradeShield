import { useState, useEffect } from 'react';
import { tradingEngine, Portfolio, Order, Position, Trade } from '../services/tradingEngine';

export const useTrading = (userAddress: string | null) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load portfolio on mount or when user changes
  useEffect(() => {
    if (userAddress) {
      loadPortfolio();
    } else {
      setPortfolio(null);
    }
  }, [userAddress]);

  const loadPortfolio = () => {
    if (!userAddress) return;
    
    try {
      const portfolioData = tradingEngine.getPortfolio(userAddress);
      setPortfolio(portfolioData);
      setError(null);
    } catch (err) {
      setError('Failed to load portfolio');
      console.error('Error loading portfolio:', err);
    }
  };

  const createOrder = async (
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit',
    size: number,
    price?: number
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    if (!userAddress) {
      return { success: false, error: 'User not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const order = tradingEngine.createOrder(userAddress, symbol, side, type, size, price);
      
      // Reload portfolio to get updated data
      loadPortfolio();
      
      return { success: true, order };
    } catch (err) {
      const errorMsg = 'Failed to create order';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
    if (!userAddress) {
      return { success: false, error: 'User not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = tradingEngine.cancelOrder(userAddress, orderId);
      
      if (success) {
        loadPortfolio();
        return { success: true };
      } else {
        return { success: false, error: 'Failed to cancel order' };
      }
    } catch (err) {
      const errorMsg = 'Failed to cancel order';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrices = (prices: { [symbol: string]: number }) => {
    tradingEngine.updatePrices(prices);
    if (userAddress) {
      tradingEngine.updatePositions(userAddress);
      loadPortfolio();
    }
  };

  const getOpenOrders = (): Order[] => {
    if (!userAddress) return [];
    return tradingEngine.getOpenOrders(userAddress);
  };

  const getPositions = (): Position[] => {
    if (!userAddress) return [];
    return tradingEngine.getPositions(userAddress);
  };

  const getTradeHistory = (): Trade[] => {
    if (!userAddress) return [];
    return tradingEngine.getTradeHistory(userAddress);
  };

  const getPortfolioSummary = () => {
    if (!userAddress) return null;
    return tradingEngine.getPortfolioSummary(userAddress);
  };

  return {
    portfolio,
    isLoading,
    error,
    createOrder,
    cancelOrder,
    updatePrices,
    getOpenOrders,
    getPositions,
    getTradeHistory,
    getPortfolioSummary,
    loadPortfolio
  };
};
