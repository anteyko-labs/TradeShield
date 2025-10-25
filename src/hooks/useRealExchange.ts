import { useState, useEffect, useCallback } from 'react';
import { useDirectWeb3 } from './useDirectWeb3';
import { realExchangeService } from '../services/realExchangeService';

export const useRealExchange = () => {
  const { address, provider, signer } = useDirectWeb3();
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация сервиса
  useEffect(() => {
    if (provider && signer && !realExchangeService.provider) {
      console.log('🔄 Initializing real exchange service...');
      realExchangeService.initialize(provider, signer);
      console.log('✅ Real exchange service initialized');
    }
  }, [provider, signer]);

  // Загрузка курсов обмена
  const loadExchangeRates = useCallback(async () => {
    if (!realExchangeService.provider) return;

    try {
      setLoading(true);
      setError(null);

      const rates = await realExchangeService.getRealExchangeRates();
      setExchangeRates(rates);
      
      console.log('📊 Exchange rates loaded:', rates);
    } catch (err) {
      console.error('❌ Error loading exchange rates:', err);
      setError('Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  }, []);

  // Автоматическая загрузка курсов
  useEffect(() => {
    if (realExchangeService.provider) {
      loadExchangeRates();
      
      // Обновляем курсы каждые 30 секунд
      const interval = setInterval(loadExchangeRates, 30000);
      return () => clearInterval(interval);
    }
  }, [loadExchangeRates]);

  // Выполнить обмен
  const executeExchange = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!address || !realExchangeService.provider) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await realExchangeService.executeExchange(
        tokenIn,
        tokenOut,
        amountIn,
        address
      );

      if (result.success) {
        console.log('✅ Exchange executed successfully:', result.txHash);
        // Обновляем курсы после обмена
        await loadExchangeRates();
      }

      return result;
    } catch (err) {
      console.error('❌ Exchange execution error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [address, loadExchangeRates]);

  // Получить курс обмена
  const getExchangeRate = useCallback(async (tokenIn: string, tokenOut: string): Promise<number> => {
    if (!realExchangeService.provider) return 1;
    
    try {
      return await realExchangeService.getExchangeRate(tokenIn, tokenOut);
    } catch (err) {
      console.error('Error getting exchange rate:', err);
      return 1;
    }
  }, []);

  return {
    exchangeRates,
    loading,
    error,
    executeExchange,
    getExchangeRate,
    loadExchangeRates
  };
};
