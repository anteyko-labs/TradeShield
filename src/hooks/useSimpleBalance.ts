import { useState, useEffect, useCallback } from 'react';
import { useDirectWeb3 } from './useDirectWeb3';
import { simpleBalanceService } from '../services/simpleBalanceService';

export interface TokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
  address: string;
  name: string;
  valueUSD: number;
}

export const useSimpleBalance = () => {
  const { address, provider } = useDirectWeb3();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация сервиса
  useEffect(() => {
    if (provider && !simpleBalanceService.provider) {
      console.log('🔄 Initializing simple balance service...');
      simpleBalanceService.initialize(provider);
      console.log('✅ Simple balance service initialized');
    }
  }, [provider]);

  // Отладочная информация
  useEffect(() => {
    console.log('🔍 useSimpleBalance state:', { 
      address, 
      provider: !!provider, 
      balances: balances.length, 
      totalValue, 
      loading, 
      error 
    });
  }, [address, provider, balances, totalValue, loading, error]);

  // Загрузка балансов
  const loadBalances = useCallback(async () => {
    if (!address || !provider) {
      console.log('⚠️ Missing address or provider:', { address, provider });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Принудительная инициализация если нужно
      if (!simpleBalanceService.provider) {
        console.log('🔄 Force initializing simple balance service...');
        simpleBalanceService.initialize(provider);
      }
      
      console.log('🔄 Loading balances for:', address);
      
      const tokenBalances = await simpleBalanceService.getTokenBalances(address);
      const total = await simpleBalanceService.getTotalValue(address);
      
      setBalances(tokenBalances);
      setTotalValue(total);
      
      console.log('✅ Balances loaded:', tokenBalances);
      console.log('💰 Total value:', total);
      
    } catch (err) {
      console.error('❌ Error loading balances:', err);
      setError('Failed to load balances');
    } finally {
      setLoading(false);
    }
  }, [address, provider]);

  // Автоматическая загрузка при подключении кошелька
  useEffect(() => {
    if (address && provider) {
      console.log('🔄 Auto-loading balances on wallet connect...');
      loadBalances();
    }
  }, [address, provider]);

  // Получить баланс конкретного токена
  const getBalance = useCallback((symbol: string): number => {
    const token = balances.find(b => b.symbol === symbol);
    return token ? token.balance : 0;
  }, [balances]);

  // Получить USDT баланс
  const getUSDTBalance = useCallback((): number => {
    return getBalance('USDT');
  }, [getBalance]);

  return {
    balances,
    totalValue,
    loading,
    error,
    loadBalances,
    getBalance,
    getUSDTBalance
  };
};
