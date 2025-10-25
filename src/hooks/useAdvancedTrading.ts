import { useState, useEffect } from 'react';
import { advancedTradingService, AdvancedTradingState, Order, Trade } from '../services/advancedTradingService';

export const useAdvancedTrading = () => {
  const [state, setState] = useState<AdvancedTradingState>(advancedTradingService.getState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = advancedTradingService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const createOrder = async (
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop',
    amount: number,
    price?: number,
    stopPrice?: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await advancedTradingService.createOrder(
        symbol,
        side,
        type,
        amount,
        price,
        stopPrice
      );

      if (!result.success) {
        setError(result.error || 'Failed to create order');
      }

      return result;
    } catch (err) {
      const errorMessage = 'Failed to create order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await advancedTradingService.cancelOrder(orderId);
      
      if (!result.success) {
        setError(result.error || 'Failed to cancel order');
      }

      return result;
    } catch (err) {
      const errorMessage = 'Failed to cancel order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getBalance = (symbol: string): number => {
    return advancedTradingService.getBalance(symbol);
  };

  const canSell = (symbol: string, amount: number): boolean => {
    return advancedTradingService.canSell(symbol, amount);
  };

  const canBuy = (symbol: string, amount: number, price: number): boolean => {
    return advancedTradingService.canBuy(symbol, amount, price);
  };

  const getMEVProtectionStatus = () => {
    return advancedTradingService.getMEVProtectionStatus();
  };

  const setMEVProtection = (settings: {
    privateMempool?: boolean;
    commitReveal?: boolean;
    antiSandwich?: boolean;
    slippageProtection?: boolean;
  }) => {
    advancedTradingService.setMEVProtection(settings);
  };

  const clearError = () => setError(null);

  return {
    ...state,
    loading,
    error,
    createOrder,
    cancelOrder,
    getBalance,
    canSell,
    canBuy,
    getMEVProtectionStatus,
    setMEVProtection,
    clearError
  };
};
