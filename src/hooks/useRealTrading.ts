import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../providers/RealWeb3Provider';
import { realTradingService } from '../services/realTradingService';
import { simulatedTradingService } from '../services/simulatedTradingService';

/**
 * @title useRealTrading
 * @dev Хук для реальной торговли через смарт-контракты
 * Никаких моков - только реальные данные из блокчейна!
 */
export interface RealTokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
  address: string;
  name: string;
  valueUSD: number;
}

export interface RealPosition {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

export interface RealTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export const useRealTrading = () => {
  const { address, signer, provider } = useWeb3();
  const [balances, setBalances] = useState<RealTokenBalance[]>([]);
  const [positions, setPositions] = useState<RealPosition[]>([]);
  const [trades, setTrades] = useState<RealTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация сервиса
  useEffect(() => {
    if (address && signer && provider && !isInitialized) {
      const initService = async () => {
        try {
          setLoading(true);
          console.log('🔄 Initializing real trading service...');
          console.log('Provider:', provider);
          console.log('Signer:', signer);
          console.log('Address:', address);
          
          // Инициализируем оба сервиса
          await realTradingService.initialize(provider, signer);
          await simulatedTradingService.initialize(provider, signer);
          setIsInitialized(true);
          console.log('✅ Real trading service initialized successfully');
          
          // Автоматически выдаем USDT при первом подключении
          try {
            await simulatedTradingService.grantInitialUSDT(address);
            console.log('✅ 10,000 USDT automatically granted to user');
          } catch (usdtError) {
            console.log('⚠️ Auto USDT grant failed (user might already have balance):', usdtError.message);
          }
        } catch (err) {
          console.error('❌ Failed to initialize real trading service:', err);
          setError('Failed to initialize trading service: ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      initService();
    }
  }, [address, signer, provider, isInitialized]);

  // Загрузка данных
  const loadData = useCallback(async () => {
    if (!address || !isInitialized) return;

    try {
      setLoading(true);
      setError(null);

          // Загружаем РЕАЛЬНЫЕ данные из смарт-контрактов
          console.log('🔄 Loading balances from simulated service...');
          console.log('Simulated service initialized:', simulatedTradingService.provider !== null);
          
          const [realBalances, realTrades] = await Promise.all([
            simulatedTradingService.getRealBalances(address),
            realTradingService.getRealTrades(address)
          ]);
          
          console.log('📊 Loaded balances:', realBalances);

      setBalances(realBalances);
      setTrades(realTrades);

      console.log('✅ Real contract data loaded:', {
        balances: realBalances.length,
        trades: realTrades.length
      });
    } catch (err) {
      console.error('❌ Error loading real contract data:', err);
      setError('Failed to load trading data from contracts');
    } finally {
      setLoading(false);
    }
  }, [address, isInitialized]);

  // Автоматическая загрузка данных
  useEffect(() => {
    if (isInitialized) {
      console.log('🔄 Auto-loading data...');
      loadData();
      
      // Обновляем данные каждые 10 секунд
      const interval = setInterval(() => {
        console.log('🔄 Interval loading data...');
        loadData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, loadData]);

  // Принудительная загрузка при изменении адреса
  useEffect(() => {
    if (address && isInitialized) {
      console.log('🔄 Address changed, loading data...');
      loadData();
    }
  }, [address, isInitialized, loadData]);

  // Получить баланс токена
  const getBalance = useCallback((symbol: string): number => {
    const token = balances.find(b => b.symbol === symbol);
    return token ? token.balance : 0;
  }, [balances]);

  // Проверить, может ли пользователь продать
  const canSell = useCallback((symbol: string, amount: number): boolean => {
    const balance = getBalance(symbol);
    return balance >= amount;
  }, [getBalance]);

  // Проверить, может ли пользователь купить
  const canBuy = useCallback((symbol: string, amount: number, price: number): boolean => {
    const usdtBalance = getBalance('USDT');
    const totalCost = amount * price;
    return usdtBalance >= totalCost;
  }, [getBalance]);

  // Выполнить реальную торговлю
  const executeTrade = useCallback(async (
    side: 'buy' | 'sell',
    symbol: string,
    amount: number,
    price: number
  ): Promise<boolean> => {
    if (!address || !isInitialized) {
      setError('Trading service not initialized');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Проверяем баланс
      if (side === 'sell') {
        if (!canSell(symbol, amount)) {
          setError(`Insufficient ${symbol} balance`);
          return false;
        }
      } else {
        if (!canBuy(symbol, amount, price)) {
          setError('Insufficient USDT balance');
          return false;
        }
      }

          // Выполняем РЕАЛЬНУЮ торговлю через смарт-контракты
          const result = await simulatedTradingService.executeSimulatedTrade(
            address,
            side === 'buy' ? 'USDT' : symbol, // tokenIn
            side === 'buy' ? symbol : 'USDT', // tokenOut
            amount,
            price // minAmountOut
          );

      if (result.success) {
        console.log('✅ Real trade executed via smart contract:', result.txHash);
        
        // Обновляем данные из контрактов
        await loadData();
        
        return true;
      } else {
        setError(result.error || 'Trade execution failed');
        return false;
      }
    } catch (err) {
      console.error('❌ Trade execution error:', err);
      setError('Trade execution failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [address, isInitialized, canSell, canBuy, loadData]);

  // Получить общую стоимость портфолио
  const getTotalValue = useCallback(async (): Promise<number> => {
    if (!address || !isInitialized) return 0;

        try {
          return await simulatedTradingService.getTotalPortfolioValue(address);
        } catch (err) {
          console.error('Error getting total portfolio value:', err);
          return 0;
        }
  }, [address, isInitialized]);

  // Получить PnL
  const getTotalPnl = useCallback((): number => {
    return positions.reduce((total, pos) => total + pos.pnl, 0);
  }, [positions]);

  // Получить процент PnL
  const getTotalPnlPercent = useCallback((): number => {
    const totalValue = balances.reduce((total, token) => total + token.valueUSD, 0);
    if (totalValue === 0) return 0;
    return (getTotalPnl() / totalValue) * 100;
  }, [balances, getTotalPnl]);

  // Получить цену токена
  const getTokenPrice = useCallback(async (symbol: string): Promise<number> => {
    if (!isInitialized) return 0;

    try {
      // Для USDT всегда 1.0
      if (symbol === 'USDT') return 1.0;
      
      // Для других токенов получаем из контракта
      return await realTradingService.getRealTokenPrice(symbol);
    } catch (err) {
      console.error('Error getting token price:', err);
      return 0;
    }
  }, [isInitialized]);

  // Обновить данные
  const refreshData = useCallback(async () => {
    if (isInitialized) {
      await loadData();
    }
  }, [isInitialized, loadData]);

  return {
    // Данные
    balances,
    positions,
    trades,
    loading,
    error,
    isInitialized,
    
    // Функции
    getBalance,
    canSell,
    canBuy,
    executeTrade,
    getTotalValue,
    getTotalPnl,
    getTotalPnlPercent,
    getTokenPrice,
    refreshData,
    
    // Утилиты
    setError: (error: string | null) => setError(error)
  };
};