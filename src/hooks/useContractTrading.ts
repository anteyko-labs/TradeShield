import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../providers/RealWeb3Provider';
import { contractService, ContractConfig, TokenInfo } from '../services/contractService';

export interface ContractTokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
  valueUSD: number;
  address: string;
  name: string;
}

export interface ContractTradingPosition {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  valueUSD: number;
  address: string;
}

export interface ContractTradeHistory {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  totalValue: number;
  timestamp: number;
  txHash: string;
}

export const useContractTrading = () => {
  const { address, provider, signer } = useWeb3();
  const [balances, setBalances] = useState<ContractTokenBalance[]>([]);
  const [positions, setPositions] = useState<ContractTradingPosition[]>([]);
  const [tradeHistory, setTradeHistory] = useState<ContractTradeHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Конфигурация контрактов (РЕАЛЬНЫЕ АДРЕСА С SEPOLIA)
  const contractConfig: ContractConfig = {
    tokenRegistryAddress: '0x0C4d6A274e052a3F727225B77466E02514F9E6B1',
    dexAddress: '0x888F6Fd191776f7671D6B371d13d755760fb820F',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    chainId: 11155111 // Sepolia
  };

  // Инициализация контрактного сервиса
  useEffect(() => {
    if (address && signer && !isInitialized) {
      const initContractService = async () => {
        try {
          await contractService.initialize(contractConfig, signer);
          setIsInitialized(true);
          await loadUserData();
        } catch (error) {
          console.error('Failed to initialize contract service:', error);
          setError('Failed to connect to contracts');
        }
      };
      initContractService();
    }
  }, [address, signer, isInitialized]);

  // Загрузка данных пользователя
  const loadUserData = useCallback(async () => {
    if (!isInitialized || !address) return;

    try {
      setLoading(true);
      
      // Загружаем токены пользователя
      const userTokens = await contractService.getUserTokens();
      const ethBalance = await contractService.getETHBalance();
      
      // Конвертируем в наш формат
      const tokenBalances: ContractTokenBalance[] = userTokens.map(token => ({
        symbol: token.symbol,
        balance: parseFloat(ethers.utils.formatUnits(token.balance, token.decimals)),
        decimals: token.decimals,
        valueUSD: 0, // Будет обновлено через priceService
        address: token.address,
        name: token.name
      }));

      // Добавляем ETH баланс
      tokenBalances.push({
        symbol: 'ETH',
        balance: parseFloat(ethBalance),
        decimals: 18,
        valueUSD: 0,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum'
      });

      setBalances(tokenBalances);

      // Загружаем историю торгов из localStorage (в реальном приложении это должно быть из контрактов)
      const savedHistory = localStorage.getItem('contract_trading_history');
      if (savedHistory) {
        setTradeHistory(JSON.parse(savedHistory));
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [isInitialized, address]);

  // Получить баланс токена
  const getBalance = useCallback((symbol: string): number => {
    const token = balances.find(b => b.symbol === symbol);
    return token ? token.balance : 0;
  }, [balances]);

  // Проверить, можно ли продать
  const canSell = useCallback((symbol: string, amount: number): boolean => {
    const balance = getBalance(symbol);
    return balance >= amount;
  }, [getBalance]);

  // Проверить, можно ли купить (проверяем ETH баланс для покупки)
  const canBuy = useCallback((symbol: string, amount: number, price: number): boolean => {
    if (symbol === 'ETH') {
      const ethBalance = getBalance('ETH');
      return ethBalance >= amount;
    } else {
      // Для других токенов проверяем USDT баланс
      const usdtBalance = getBalance('USDT');
      const totalCost = amount * price;
      return usdtBalance >= totalCost;
    }
  }, [getBalance]);

  // Выполнить торговлю через контракты
  const executeTrade = useCallback(async (
    type: 'buy' | 'sell',
    symbol: string,
    amount: number,
    price: number
  ): Promise<boolean> => {
    if (!isInitialized || !address) {
      setError('Contract service not initialized');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Получаем адреса токенов
      let tokenInAddress: string;
      let tokenOutAddress: string;
      let amountIn: string;
      let minAmountOut: string;

      if (type === 'buy') {
        // Покупаем токен за USDT
        tokenInAddress = await contractService.getTokenBySymbol('USDT');
        tokenOutAddress = await contractService.getTokenBySymbol(symbol);
        amountIn = ethers.utils.parseUnits((amount * price).toString(), 6); // USDT имеет 6 decimals
        minAmountOut = ethers.utils.parseUnits(amount.toString(), 18); // Предполагаем 18 decimals для большинства токенов
      } else {
        // Продаем токен за USDT
        tokenInAddress = await contractService.getTokenBySymbol(symbol);
        tokenOutAddress = await contractService.getTokenBySymbol('USDT');
        amountIn = ethers.utils.parseUnits(amount.toString(), 18);
        minAmountOut = ethers.utils.parseUnits((amount * price).toString(), 6);
      }

      // Выполняем свап через контракт
      const tx = await contractService.swap(tokenInAddress, tokenOutAddress, amountIn, minAmountOut);
      
      // Ждем подтверждения транзакции
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Транзакция успешна
        const trade: ContractTradeHistory = {
          id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type,
          symbol,
          amount,
          price,
          totalValue: amount * price,
          timestamp: Date.now(),
          txHash: tx.hash
        };

        // Добавляем в историю
        setTradeHistory(prev => {
          const newHistory = [trade, ...prev.slice(0, 99)];
          localStorage.setItem('contract_trading_history', JSON.stringify(newHistory));
          return newHistory;
        });

        // Обновляем данные
        await loadUserData();
        
        return true;
      } else {
        setError('Transaction failed');
        return false;
      }

    } catch (error) {
      console.error('Trade execution failed:', error);
      setError(`Trade failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isInitialized, address, loadUserData]);

  // Получить общую стоимость портфолио
  const getTotalValue = useCallback((): number => {
    return balances.reduce((total, token) => total + token.valueUSD, 0);
  }, [balances]);

  // Получить общий PnL
  const getTotalPnl = useCallback((): number => {
    return positions.reduce((total, position) => total + position.pnl, 0);
  }, [positions]);

  // Получить процент PnL
  const getTotalPnlPercent = useCallback((): number => {
    const totalInvested = positions.reduce((total, position) => total + (position.entryPrice * position.amount), 0);
    const totalPnl = getTotalPnl();
    return totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  }, [positions, getTotalPnl]);

  // Обновление цен (вызывается извне)
  const updatePrices = useCallback((prices: { [symbol: string]: number }) => {
    setBalances(prev => prev.map(token => ({
      ...token,
      valueUSD: token.balance * (prices[token.symbol] || 0)
    })));

    setPositions(prev => prev.map(position => {
      const currentPrice = prices[position.symbol] || position.currentPrice;
      const pnl = (currentPrice - position.entryPrice) * position.amount;
      const pnlPercent = position.entryPrice > 0 ? (pnl / (position.entryPrice * position.amount)) * 100 : 0;
      
      return {
        ...position,
        currentPrice,
        pnl,
        pnlPercent,
        valueUSD: position.amount * currentPrice
      };
    }));
  }, []);

  return {
    balances,
    positions,
    tradeHistory,
    loading,
    error,
    isInitialized,
    getBalance,
    canSell,
    canBuy,
    executeTrade,
    getTotalValue,
    getTotalPnl,
    getTotalPnlPercent,
    updatePrices,
    clearError: () => setError(null)
  };
};
