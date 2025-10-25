import { ethers } from 'ethers';

export interface UserTradeResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
}

class UserTradingService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer?: ethers.Signer;
  
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
  }

  async initialize(provider: ethers.providers.Web3Provider, signer: ethers.Signer): Promise<void> {
    this.provider = provider;
    this.signer = signer;
    console.log('👤 UserTradingService инициализирован (ПРОСТАЯ СИСТЕМА)');
  }

  // ПОКУПКА ТОКЕНА ПОЛЬЗОВАТЕЛЕМ (ПРОСТАЯ СИСТЕМА)
  async buyToken(tokenSymbol: string, usdtAmount: string): Promise<UserTradeResult> {
    if (!this.signer) {
      return { success: false, error: 'Сервис не инициализирован' };
    }

    try {
      console.log(`💰 ПРОСТАЯ покупка ${tokenSymbol} за ${usdtAmount} USDT...`);
      const userAddress = await this.signer.getAddress();
      
      // Получаем цену токена
      const { priceService } = await import('./priceService');
      const tokenPrice = priceService.getPrice(tokenSymbol) || 
        (tokenSymbol === 'BTC' ? 110203 : 
         tokenSymbol === 'ETH' ? 3000 : 1);
      
      const tokenAmount = parseFloat(usdtAmount) / tokenPrice;
      
      // Проверяем баланс USDT у пользователя
      const { userBalanceService } = await import('./userBalanceService');
      const usdtBalance = userBalanceService.getAvailableBalance(userAddress, 'USDT');
      if (usdtBalance < parseFloat(usdtAmount)) {
        return { success: false, error: 'Недостаточно USDT' };
      }

      // Ищем подходящий ордер у ботов
      const { realBotService } = await import('./realBotService');
      const orderBook = realBotService.getOrderBook();
      
      // Ищем ask ордер (продажа) с подходящей ценой
      const suitableAsk = orderBook.asks.find(ask => 
        ask.token === tokenSymbol && 
        ask.price <= tokenPrice * 1.01 && // 1% спред
        ask.amount >= tokenAmount * 0.5 // минимум половина нужного количества
      );

      if (!suitableAsk) {
        return { success: false, error: 'Нет подходящих ордеров для покупки' };
      }

      // Выполняем торговлю
      const actualAmount = Math.min(tokenAmount, suitableAsk.amount);
      const actualPrice = suitableAsk.price;
      const totalCost = actualAmount * actualPrice;

      // Обновляем балансы
      userBalanceService.subtractTokens(userAddress, 'USDT', totalCost);
      userBalanceService.addTokens(userAddress, tokenSymbol, actualAmount);

      // Обновляем баланс бота
      const { realBotService: botService } = await import('./realBotService');
      botService.updateBotBalance(suitableAsk.botId, 'USDT', totalCost);
      botService.updateBotBalance(suitableAsk.botId, tokenSymbol, -actualAmount);

      console.log(`✅ ПРОСТАЯ покупка успешна! Получено: ${actualAmount.toFixed(6)} ${tokenSymbol} за $${totalCost.toFixed(2)}`);
      
      return {
        success: true,
        txHash: `simple_${Date.now()}`,
        gasUsed: '0'
      };

    } catch (error: any) {
      console.error('❌ Ошибка простой покупки:', error);
      return {
        success: false,
        error: error.message || 'Неизвестная ошибка'
      };
    }
  }

  // ПРОДАЖА ТОКЕНА ПОЛЬЗОВАТЕЛЕМ (ПРОСТАЯ СИСТЕМА)
  async sellToken(tokenSymbol: string, tokenAmount: string): Promise<UserTradeResult> {
    if (!this.signer) {
      return { success: false, error: 'Сервис не инициализирован' };
    }

    try {
      console.log(`💸 ПРОСТАЯ продажа ${tokenAmount} ${tokenSymbol}...`);
      const userAddress = await this.signer.getAddress();
      
      // Проверяем баланс через userBalanceService
      const { userBalanceService } = await import('./userBalanceService');
      const availableBalance = userBalanceService.getAvailableBalance(userAddress, tokenSymbol);
      
      if (availableBalance < parseFloat(tokenAmount)) {
        return { success: false, error: `Недостаточно ${tokenSymbol}. Доступно: ${availableBalance}` };
      }

      // Получаем цену токена
      const { priceService } = await import('./priceService');
      const tokenPrice = priceService.getPrice(tokenSymbol) || 
        (tokenSymbol === 'BTC' ? 110203 : 
         tokenSymbol === 'ETH' ? 3000 : 1);
      
      const usdtAmount = parseFloat(tokenAmount) * tokenPrice;
      
      // Ищем подходящий bid ордер у ботов
      const { realBotService } = await import('./realBotService');
      const orderBook = realBotService.getOrderBook();
      
      // Ищем bid ордер (покупка) с подходящей ценой
      const suitableBid = orderBook.bids.find(bid => 
        bid.token === tokenSymbol && 
        bid.price >= tokenPrice * 0.99 && // 1% спред
        bid.amount >= parseFloat(tokenAmount) * 0.5 // минимум половина нужного количества
      );

      if (!suitableBid) {
        return { success: false, error: 'Нет подходящих ордеров для продажи' };
      }

      // Выполняем торговлю
      const actualAmount = Math.min(parseFloat(tokenAmount), suitableBid.amount);
      const actualPrice = suitableBid.price;
      const totalUsdt = actualAmount * actualPrice;

      // Обновляем балансы
      userBalanceService.subtractTokens(userAddress, tokenSymbol, actualAmount);
      userBalanceService.addTokens(userAddress, 'USDT', totalUsdt);

      // Обновляем баланс бота
      const { realBotService: botService } = await import('./realBotService');
      botService.updateBotBalance(suitableBid.botId, 'USDT', -totalUsdt);
      botService.updateBotBalance(suitableBid.botId, tokenSymbol, actualAmount);

      console.log(`✅ ПРОСТАЯ продажа успешна! Получено: ${totalUsdt.toFixed(2)} USDT за ${actualAmount.toFixed(6)} ${tokenSymbol}`);
      
      return {
        success: true,
        txHash: `simple_${Date.now()}`,
        gasUsed: '0'
      };

    } catch (error: any) {
      console.error('❌ Ошибка простой продажи:', error);
      return {
        success: false,
        error: error.message || 'Неизвестная ошибка'
      };
    }
  }

  // Получить баланс токена (для совместимости)
  async getTokenBalance(tokenSymbol: string): Promise<string> {
    if (!this.signer) return '0';
    
    try {
      const userAddress = await this.signer.getAddress();
      const { userBalanceService } = await import('./userBalanceService');
      const balance = userBalanceService.getAvailableBalance(userAddress, tokenSymbol);
      return balance.toString();
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
      return '0';
    }
  }
}

export const userTradingService = new UserTradingService();