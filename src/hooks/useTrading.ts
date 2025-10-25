import { useState, useEffect } from 'react';
import { useWeb3 } from '../providers/RealWeb3Provider';

export interface TokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
}

export interface TradingPosition {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export const useTrading = () => {
  const { address } = useWeb3();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock balances for testing (в реальном приложении это будет из контрактов)
  useEffect(() => {
    if (address) {
      // Имитируем загрузку балансов
      setLoading(true);
      setTimeout(() => {
        setBalances([
          { symbol: 'USDT', balance: 10000, decimals: 6 },
          { symbol: 'BTC', balance: 0.5, decimals: 8 },
          { symbol: 'ETH', balance: 2.0, decimals: 18 },
          { symbol: 'TSD', balance: 5000, decimals: 18 },
          { symbol: 'TSP', balance: 10000, decimals: 18 },
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [address]);

  const getBalance = (symbol: string): number => {
    const token = balances.find(b => b.symbol === symbol);
    return token ? token.balance : 0;
  };

  const canSell = (symbol: string, amount: number): boolean => {
    const balance = getBalance(symbol);
    return balance >= amount;
  };

  const canBuy = (symbol: string, amount: number, price: number): boolean => {
    // Check if we have enough USDT to buy the specified amount of symbol
    const usdtBalance = getBalance('USDT');
    const totalCost = amount * price;
    return usdtBalance >= totalCost;
  };

  const executeTrade = async (
    type: 'buy' | 'sell',
    symbol: string,
    amount: number,
    price: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (type === 'sell') {
        if (!canSell(symbol, amount)) {
          setError(`Insufficient ${symbol} balance. You have ${getBalance(symbol)} ${symbol}`);
          return false;
        }
      } else {
        if (!canBuy(symbol, amount, price)) {
          const usdtBalance = getBalance('USDT');
          const required = amount * price;
          setError(`Insufficient USDT balance. You have ${usdtBalance} USDT, need ${required} USDT`);
          return false;
        }
      }

      // Имитируем выполнение торговли
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Обновляем балансы
      setBalances(prev => {
        const newBalances = [...prev];
        
        if (type === 'sell') {
          // Продаем токен, получаем USDT
          const tokenIndex = newBalances.findIndex(b => b.symbol === symbol);
          const usdtIndex = newBalances.findIndex(b => b.symbol === 'USDT');
          
          if (tokenIndex !== -1) {
            newBalances[tokenIndex].balance -= amount;
          }
          if (usdtIndex !== -1) {
            newBalances[usdtIndex].balance += amount * price;
          }
        } else {
          // Покупаем токен, тратим USDT
          const tokenIndex = newBalances.findIndex(b => b.symbol === symbol);
          const usdtIndex = newBalances.findIndex(b => b.symbol === 'USDT');
          
          if (tokenIndex !== -1) {
            newBalances[tokenIndex].balance += amount;
          } else {
            newBalances.push({ symbol, balance: amount, decimals: 18 });
          }
          if (usdtIndex !== -1) {
            newBalances[usdtIndex].balance -= amount * price;
          }
        }
        
        return newBalances;
      });

      // Обновляем позиции
      updatePositions(symbol, amount, price, type);

      return true;
    } catch (err) {
      setError('Trade execution failed');
      console.error('Trade error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePositions = (symbol: string, amount: number, price: number, type: 'buy' | 'sell') => {
    setPositions(prev => {
      const existingPosition = prev.find(p => p.symbol === symbol);
      
      if (existingPosition) {
        if (type === 'buy') {
          // Увеличиваем позицию
          const newAmount = existingPosition.amount + amount;
          const newEntryPrice = (existingPosition.entryPrice * existingPosition.amount + price * amount) / newAmount;
          
          return prev.map(p => 
            p.symbol === symbol 
              ? { ...p, amount: newAmount, entryPrice: newEntryPrice }
              : p
          );
        } else {
          // Уменьшаем позицию
          const newAmount = existingPosition.amount - amount;
          if (newAmount <= 0) {
            return prev.filter(p => p.symbol !== symbol);
          }
          
          return prev.map(p => 
            p.symbol === symbol 
              ? { ...p, amount: newAmount }
              : p
          );
        }
      } else if (type === 'buy') {
        // Создаем новую позицию
        return [...prev, {
          symbol,
          amount,
          entryPrice: price,
          currentPrice: price,
          pnl: 0,
          pnlPercent: 0
        }];
      }
      
      return prev;
    });
  };

  const getTotalValue = (): number => {
    return balances.reduce((total, token) => {
      // Для простоты считаем все токены в USDT
      // В реальном приложении нужно получать актуальные цены
      const mockPrices: { [key: string]: number } = {
        'USDT': 1,
        'BTC': 110000,
        'ETH': 3200,
        'TSD': 1.05,
        'TSP': 0.85
      };
      return total + (token.balance * (mockPrices[token.symbol] || 0));
    }, 0);
  };

  return {
    balances,
    positions,
    loading,
    error,
    getBalance,
    canSell,
    canBuy,
    executeTrade,
    getTotalValue,
    clearError: () => setError(null)
  };
};