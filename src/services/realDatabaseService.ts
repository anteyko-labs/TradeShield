import { ethers } from 'ethers';

export interface PersistentBot {
  id: string;
  name: string;
  address: string;
  privateKey: string;
  balances: {
    USDT: number;
    BTC: number;
    ETH: number;
  };
  isActive: boolean;
  lastTrade: number;
  totalTrades: number;
  totalVolume: number;
  totalFees: number;
}

export interface PersistentTrade {
  id: string;
  timestamp: number;
  botId: string;
  botName: string;
  side: 'buy' | 'sell';
  token: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  txHash: string;
  blockNumber?: number;
  fromAddress?: string;
  toAddress?: string;
}

export interface PersistentOrder {
  id: string;
  botId: string;
  botName: string;
  side: 'buy' | 'sell';
  token: string;
  amount: number;
  price: number;
  total: number;
  timestamp: number;
  filled: boolean;
  filledAt?: number;
}

class RealDatabaseService {
  private bots: PersistentBot[] = [];
  private trades: PersistentTrade[] = [];
  private orders: { bids: PersistentOrder[]; asks: PersistentOrder[] } = { bids: [], asks: [] };
  private isInitialized = false;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private tradingInterval: NodeJS.Timeout | null = null;
  private orderBookInterval: NodeJS.Timeout | null = null;
  private saveCounter: number = 0;

  // Инициализация с автосохранением
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Инициализация реальной базы данных...');
    
    // Загружаем сохраненные данные
    await this.loadFromStorage();
    
    // Создаем ботов если их нет
    if (this.bots.length === 0) {
      this.createPersistentBots();
    }
    
    // Запускаем автоматизацию
    this.startAutoSave();
    this.startAutoTrading();
    this.startAutoOrderBook();
    
    this.isInitialized = true;
    console.log('✅ Реальная база данных инициализирована');
    console.log(`🤖 Ботов: ${this.bots.length}`);
    console.log(`📊 Сделок: ${this.trades.length}`);
  }

  // Создаем постоянных ботов
  private createPersistentBots() {
    const botNames = [
      'AlphaTrader', 'BetaBuyer', 'GammaGains', 'DeltaDump', 'EpsilonEarn',
      'ZetaZone', 'EtaExchange', 'ThetaTrade', 'IotaInvestor', 'KappaKrypto',
      'LambdaLiquidity', 'MuMarket', 'NuNetwork', 'XiXchange', 'OmicronOrder',
      'PiPump', 'RhoRally', 'SigmaSell', 'TauTrade', 'UpsilonUp',
      'PhiFinance', 'ChiChanger', 'PsiProfit', 'OmegaOrder', 'AlphaArbitrage',
      'BetaBull', 'GammaGrow', 'DeltaDive', 'EpsilonEarn', 'ZetaZoom',
      'EtaEarn', 'ThetaTrend', 'IotaInvest', 'KappaKash', 'LambdaLend',
      'MuMoney', 'NuNet', 'XiXchange', 'OmicronOpt', 'PiProfit'
    ];

    this.bots = [];
    
    for (let i = 0; i < 40; i++) {
      const wallet = ethers.Wallet.createRandom();
      
      const bot: PersistentBot = {
        id: `persistent_bot_${i + 1}`,
        name: botNames[i],
        address: wallet.address,
        privateKey: wallet.privateKey,
        balances: {
          USDT: Math.random() * 50000 + 10000,
          BTC: Math.random() * 2 + 0.1,
          ETH: Math.random() * 50 + 5
        },
        isActive: true,
        lastTrade: Date.now(),
        totalTrades: 0,
        totalVolume: 0,
        totalFees: 0
      };
      
      this.bots.push(bot);
    }
    
    console.log(`🤖 Создано ${this.bots.length} постоянных ботов`);
  }

  // Автосохранение каждые 5 секунд
  private startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveToStorage();
    }, 5000);
    
    console.log('💾 Автосохранение запущено (каждые 5 сек)');
  }

  // Автоторговля каждые 2-8 секунд
  private startAutoTrading() {
    this.tradingInterval = setInterval(() => {
      this.executeRandomTrade();
    }, Math.random() * 6000 + 2000);
    
    console.log('🔄 Автоторговля запущена');
  }

  // Автообновление стакана каждые 1-3 секунды
  private startAutoOrderBook() {
    this.orderBookInterval = setInterval(() => {
      this.updateOrderBook();
    }, Math.random() * 2000 + 1000);
    
    console.log('📊 Автообновление стакана запущено');
  }

  // Выполнение случайной сделки
  private executeRandomTrade() {
    const activeBots = this.bots.filter(bot => bot.isActive);
    if (activeBots.length === 0) return;

    const randomBot = activeBots[Math.floor(Math.random() * activeBots.length)];
    const tokens = ['BTC', 'ETH', 'USDT'];
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    
    // Реальные цены с небольшими колебаниями
    const basePrices = {
      BTC: 65000 + Math.random() * 10000,
      ETH: 3000 + Math.random() * 1000,
      USDT: 1
    };

    const amount = Math.random() * 0.5 + 0.1;
    const price = basePrices[randomToken as keyof typeof basePrices];
    const total = amount * price;
    const fee = total * 0.002;

    // Проверяем баланс
    if (side === 'buy' && randomBot.balances.USDT < total) return;
    if (side === 'sell' && randomBot.balances[randomToken as keyof typeof basePrices] < amount) return;

    // Обновляем балансы
    if (side === 'buy') {
      randomBot.balances.USDT -= total;
      randomBot.balances[randomToken as keyof typeof basePrices] += amount;
    } else {
      randomBot.balances[randomToken as keyof typeof basePrices] -= amount;
      randomBot.balances.USDT += total;
    }

    // Создаем сделку
    const trade: PersistentTrade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      botId: randomBot.id,
      botName: randomBot.name,
      side,
      token: randomToken,
      amount,
      price,
      total,
      fee,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      fromAddress: randomBot.address,
      toAddress: side === 'buy' ? 'Exchange' : randomBot.address
    };

    this.trades.push(trade);
    
    // Обновляем статистику бота
    randomBot.lastTrade = Date.now();
    randomBot.totalTrades++;
    randomBot.totalVolume += total;
    randomBot.totalFees += fee;

    // Ограничиваем количество сделок (последние 1000)
    if (this.trades.length > 1000) {
      this.trades = this.trades.slice(-1000);
    }

    console.log(`🤖 ${randomBot.name} ${side} ${amount.toFixed(4)} ${randomToken} @ $${price.toFixed(2)} (${randomBot.totalTrades} сделок)`);
  }

  // Обновление стакана
  private updateOrderBook() {
    this.orders = { bids: [], asks: [] };
    
    this.bots.forEach(bot => {
      if (!bot.isActive) return;
      
      const tokens = ['BTC', 'ETH'];
      const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
      
      const basePrices = {
        BTC: 65000 + Math.random() * 10000,
        ETH: 3000 + Math.random() * 1000
      };

      const price = basePrices[randomToken as keyof typeof basePrices];
      const amount = Math.random() * 0.5 + 0.1;
      const total = amount * price;

      // Покупательные ордера
      if (Math.random() > 0.5) {
        this.orders.bids.push({
          id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          botId: bot.id,
          botName: bot.name,
          side: 'buy',
          token: randomToken,
          amount,
          price,
          total,
          timestamp: Date.now(),
          filled: false
        });
      }

      // Продажные ордера
      if (Math.random() > 0.5) {
        this.orders.asks.push({
          id: `ask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          botId: bot.id,
          botName: bot.name,
          side: 'sell',
          token: randomToken,
          amount,
          price,
          total,
          timestamp: Date.now(),
          filled: false
        });
      }
    });

    // Сортируем и берем топ-9
    this.orders.bids.sort((a, b) => b.price - a.price);
    this.orders.asks.sort((a, b) => a.price - b.price);
    
    this.orders.bids = this.orders.bids.slice(0, 9);
    this.orders.asks = this.orders.asks.slice(0, 9);
  }

  // Сохранение в localStorage И JSON файл
  private async saveToStorage() {
    try {
      const data = {
        bots: this.bots,
        trades: this.trades,
        orders: this.orders,
        lastUpdate: Date.now()
      };
      
      // Сохраняем в localStorage
      localStorage.setItem('realTradingDatabase', JSON.stringify(data));
      
      
      this.saveCounter++;
      console.log('💾 Автосохранение выполнено');
    } catch (error) {
      console.error('❌ Ошибка автосохранения:', error);
    }
  }

  // Загрузка из localStorage
  private async loadFromStorage() {
    try {
      const saved = localStorage.getItem('realTradingDatabase');
      if (saved) {
        const data = JSON.parse(saved);
        this.bots = data.bots || [];
        this.trades = data.trades || [];
        this.orders = data.orders || { bids: [], asks: [] };
        
        console.log('📂 Загружены данные из базы:', {
          bots: this.bots.length,
          trades: this.trades.length
        });
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
    }
  }

  // Публичные методы
  getBots() {
    return this.bots;
  }

  getTrades() {
    return this.trades.slice(-50);
  }

  getOrders() {
    return this.orders;
  }

  getStats() {
    const totalFees = this.trades.reduce((sum, trade) => sum + trade.fee, 0);
    const totalVolume = this.trades.reduce((sum, trade) => sum + trade.total, 0);
    
    return {
      totalBots: this.bots.length,
      activeBots: this.bots.filter(bot => bot.isActive).length,
      totalTrades: this.trades.length,
      activeOrders: this.orders.bids.length + this.orders.asks.length,
      totalFees: totalFees.toFixed(2),
      totalVolume: totalVolume.toFixed(2),
      lastUpdate: Date.now()
    };
  }

  // Остановка всех процессов
  stop() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
    }
    if (this.orderBookInterval) {
      clearInterval(this.orderBookInterval);
    }
    
    console.log('⏹️ Все процессы остановлены');
  }
}

export const realDatabaseService = new RealDatabaseService();
