import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../providers/RealWeb3Provider';
import { priceService, TokenPrice } from '../services/priceService';

export interface TokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
  valueUSD: number; // Стоимость в USD
}

export interface TradingPosition {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  valueUSD: number; // Общая стоимость позиции в USD
}

export interface TradeHistory {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  totalValue: number;
  timestamp: number;
  pnl?: number; // PnL для продаж
}

export const useRealTrading = () => {
  const { address } = useWeb3();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация балансов
  useEffect(() => {
    if (address) {
      setLoading(true);
      // Загружаем сохраненные данные из localStorage
      const savedBalances = localStorage.getItem('trading_balances');
      const savedPositions = localStorage.getItem('trading_positions');
      const savedHistory = localStorage.getItem('trading_history');

      if (savedBalances) {
        setBalances(JSON.parse(savedBalances));
      } else {
        // Начальные балансы
        setBalances([
          { symbol: 'USDT', balance: 10000, decimals: 6, valueUSD: 10000 },
          { symbol: 'BTC', balance: 0, decimals: 8, valueUSD: 0 },
          { symbol: 'ETH', balance: 0, decimals: 18, valueUSD: 0 },
          { symbol: 'ADA', balance: 0, decimals: 6, valueUSD: 0 },
          { symbol: 'SOL', balance: 0, decimals: 9, valueUSD: 0 },
          { symbol: 'DOT', balance: 0, decimals: 10, valueUSD: 0 },
          { symbol: 'AVAX', balance: 0, decimals: 18, valueUSD: 0 },
          { symbol: 'MATIC', balance: 0, decimals: 18, valueUSD: 0 },
          { symbol: 'LINK', balance: 0, decimals: 18, valueUSD: 0 },
        ]);
      }

      if (savedPositions) {
        setPositions(JSON.parse(savedPositions));
      }

      if (savedHistory) {
        setTradeHistory(JSON.parse(savedHistory));
      }

      setLoading(false);
    } else {
      setBalances([]);
      setPositions([]);
      setTradeHistory([]);
    }
  }, [address]);

  // Обновление цен и стоимости позиций
  useEffect(() => {
    const updatePrices = () => {
      setBalances(prev => {
        const updated = prev.map(balance => {
          const price = priceService.getPrice(balance.symbol);
          return {
            ...balance,
            valueUSD: balance.balance * price
          };
        });
        
        // Сохраняем в localStorage
        localStorage.setItem('trading_balances', JSON.stringify(updated));
        return updated;
      });

      setPositions(prev => {
        const updated = prev.map(position => {
          const currentPrice = priceService.getPrice(position.symbol);
          const pnl = (currentPrice - position.entryPrice) * position.amount;
          const pnlPercent = position.entryPrice > 0 ? (pnl / (position.entryPrice * position.amount)) * 100 : 0;
          
          return {
            ...position,
            currentPrice,
            pnl,
            pnlPercent,
            valueUSD: position.amount * currentPrice
          };
        });
        
        // Сохраняем в localStorage
        localStorage.setItem('trading_positions', JSON.stringify(updated));
        return updated;
      });
    };

    // Обновляем сразу
    updatePrices();

    // Обновляем каждые 5 секунд
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const getBalance = useCallback((symbol: string): number => {
    const token = balances.find(b => b.symbol === symbol);
    return token ? token.balance : 0;
  }, [balances]);

  const canSell = useCallback((symbol: string, amount: number): boolean => {
    const balance = getBalance(symbol);
    return balance >= amount;
  }, [getBalance]);

  const canBuy = useCallback((symbol: string, amount: number, price: number): boolean => {
    const usdtBalance = getBalance('USDT');
    const totalCost = amount * price;
    return usdtBalance >= totalCost;
  }, [getBalance]);

  const executeTrade = useCallback(async (
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
            newBalances[tokenIndex].valueUSD = newBalances[tokenIndex].balance * priceService.getPrice(symbol);
          }
          if (usdtIndex !== -1) {
            newBalances[usdtIndex].balance += amount * price;
            newBalances[usdtIndex].valueUSD = newBalances[usdtIndex].balance;
          }
        } else {
          // Покупаем токен, тратим USDT
          const tokenIndex = newBalances.findIndex(b => b.symbol === symbol);
          const usdtIndex = newBalances.findIndex(b => b.symbol === 'USDT');
          
          if (tokenIndex !== -1) {
            newBalances[tokenIndex].balance += amount;
            newBalances[tokenIndex].valueUSD = newBalances[tokenIndex].balance * priceService.getPrice(symbol);
          } else {
            newBalances.push({ 
              symbol, 
              balance: amount, 
              decimals: 18, 
              valueUSD: amount * priceService.getPrice(symbol) 
            });
          }
          if (usdtIndex !== -1) {
            newBalances[usdtIndex].balance -= amount * price;
            newBalances[usdtIndex].valueUSD = newBalances[usdtIndex].balance;
          }
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('trading_balances', JSON.stringify(newBalances));
        return newBalances;
      });

      // Обновляем позиции
      updatePositions(symbol, amount, price, type);

      // Добавляем в историю торгов
      const trade: TradeHistory = {
        id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        symbol,
        amount,
        price,
        totalValue: amount * price,
        timestamp: Date.now()
      };

      setTradeHistory(prev => {
        const newHistory = [trade, ...prev.slice(0, 99)]; // Храним последние 100 сделок
        localStorage.setItem('trading_history', JSON.stringify(newHistory));
        return newHistory;
      });

      return true;
    } catch (err) {
      setError('Trade execution failed');
      console.error('Trade error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getBalance, canSell, canBuy]);

  const updatePositions = useCallback((symbol: string, amount: number, price: number, type: 'buy' | 'sell') => {
    setPositions(prev => {
      const existingPosition = prev.find(p => p.symbol === symbol);
      
      if (existingPosition) {
        if (type === 'buy') {
          // Увеличиваем позицию
          const newAmount = existingPosition.amount + amount;
          const newEntryPrice = (existingPosition.entryPrice * existingPosition.amount + price * amount) / newAmount;
          const currentPrice = priceService.getPrice(symbol);
          const pnl = (currentPrice - newEntryPrice) * newAmount;
          const pnlPercent = newEntryPrice > 0 ? (pnl / (newEntryPrice * newAmount)) * 100 : 0;
          
          const updated = prev.map(p => 
            p.symbol === symbol 
              ? { 
                  ...p, 
                  amount: newAmount, 
                  entryPrice: newEntryPrice,
                  currentPrice,
                  pnl,
                  pnlPercent,
                  valueUSD: newAmount * currentPrice
                }
              : p
          );
          
          localStorage.setItem('trading_positions', JSON.stringify(updated));
          return updated;
        } else {
          // Уменьшаем позицию
          const newAmount = existingPosition.amount - amount;
          if (newAmount <= 0) {
            const updated = prev.filter(p => p.symbol !== symbol);
            localStorage.setItem('trading_positions', JSON.stringify(updated));
            return updated;
          }
          
          const currentPrice = priceService.getPrice(symbol);
          const pnl = (currentPrice - existingPosition.entryPrice) * newAmount;
          const pnlPercent = existingPosition.entryPrice > 0 ? (pnl / (existingPosition.entryPrice * newAmount)) * 100 : 0;
          
          const updated = prev.map(p => 
            p.symbol === symbol 
              ? { 
                  ...p, 
                  amount: newAmount,
                  currentPrice,
                  pnl,
                  pnlPercent,
                  valueUSD: newAmount * currentPrice
                }
              : p
          );
          
          localStorage.setItem('trading_positions', JSON.stringify(updated));
          return updated;
        }
      } else if (type === 'buy') {
        // Создаем новую позицию
        const currentPrice = priceService.getPrice(symbol);
        const newPosition = {
          symbol,
          amount,
          entryPrice: price,
          currentPrice,
          pnl: 0,
          pnlPercent: 0,
          valueUSD: amount * currentPrice
        };
        
        const updated = [...prev, newPosition];
        localStorage.setItem('trading_positions', JSON.stringify(updated));
        return updated;
      }
      
      return prev;
    });
  }, []);

  const getTotalValue = useCallback((): number => {
    return balances.reduce((total, token) => total + token.valueUSD, 0);
  }, [balances]);

  const getTotalPnl = useCallback((): number => {
    return positions.reduce((total, position) => total + position.pnl, 0);
  }, [positions]);

  const getTotalPnlPercent = useCallback((): number => {
    const totalInvested = positions.reduce((total, position) => total + (position.entryPrice * position.amount), 0);
    const totalPnl = getTotalPnl();
    return totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  }, [positions, getTotalPnl]);

  return {
    balances,
    positions,
    tradeHistory,
    loading,
    error,
    getBalance,
    canSell,
    canBuy,
    executeTrade,
    getTotalValue,
    getTotalPnl,
    getTotalPnlPercent,
    clearError: () => setError(null)
  };
};
