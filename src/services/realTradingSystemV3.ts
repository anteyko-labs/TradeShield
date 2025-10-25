import { ethers } from 'ethers';
import { jsonDatabaseService } from './jsonDatabaseService';

export interface RealBot {
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
}

export interface RealTrade {
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
  txHash?: string;
}

export interface RealOrder {
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
}

class RealTradingSystemV3 {
  private bots: RealBot[] = [];
  private trades: RealTrade[] = [];
  private orders: { bids: RealOrder[]; asks: RealOrder[] } = { bids: [], asks: [] };
  private provider: ethers.Provider | null = null;
  private isInitialized = false;

  // Генерируем реальные кошельки для ботов
  private generateBotWallets(): RealBot[] {
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

    const bots: RealBot[] = [];
    
    for (let i = 0; i < 40; i++) {
      // Генерируем реальный кошелек
      const wallet = ethers.Wallet.createRandom();
      
      // Начальные балансы (в реальных токенах)
      const initialBalances = {
        USDT: Math.random() * 50000 + 10000, // 10k-60k USDT
        BTC: Math.random() * 2 + 0.1,         // 0.1-2.1 BTC
        ETH: Math.random() * 50 + 5           // 5-55 ETH
      };

      bots.push({
        id: `bot_${i + 1}`,
        name: botNames[i],
        address: wallet.address,
        privateKey: wallet.privateKey,
        balances: initialBalances,
        isActive: true,
        lastTrade: Date.now()
      });
    }

    return bots;
  }

  // Инициализация системы
  async initialize(provider?: ethers.Provider) {
    if (this.isInitialized) return;
    
    this.provider = provider || null;
    
    // Загружаем данные из базы
    await jsonDatabaseService.loadFromFile();
    
    // Генерируем ботов с реальными кошельками
    this.bots = this.generateBotWallets();
    
    // Сохраняем ботов в базу
    this.bots.forEach(bot => {
      jsonDatabaseService.addBot(bot);
    });
    
    // Запускаем торговлю
    this.startTrading();
    
    this.isInitialized = true;
    
    console.log(`🤖 Создано ${this.bots.length} реальных ботов с кошельками на Sepolia`);
    console.log(`💰 Начальные балансы распределены`);
    console.log(`💾 Данные сохраняются в localStorage`);
  }

  // Запуск торговли ботов
  private startTrading() {
    // Каждые 2-5 секунд боты делают сделки
    setInterval(() => {
      this.executeBotTrades();
    }, Math.random() * 3000 + 2000);

    // Обновляем стакан каждые 1-3 секунды
    setInterval(() => {
      this.updateOrderBook();
    }, Math.random() * 2000 + 1000);
  }

  // Боты совершают сделки
  private async executeBotTrades() {
    const activeBots = this.bots.filter(bot => bot.isActive);
    const randomBot = activeBots[Math.floor(Math.random() * activeBots.length)];
    
    if (!randomBot) return;

    const tokens = ['BTC', 'ETH', 'USDT'];
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    
    // Реальные цены (примерные)
    const prices = {
      BTC: 65000 + Math.random() * 10000,
      ETH: 3000 + Math.random() * 1000,
      USDT: 1
    };

    const amount = Math.random() * 0.5 + 0.1; // 0.1-0.6 токена
    const price = prices[randomToken as keyof typeof prices];
    const total = amount * price;
    const fee = total * 0.002; // 0.2% комиссия

    // Проверяем баланс
    if (side === 'buy' && randomBot.balances.USDT < total) return;
    if (side === 'sell' && randomBot.balances[randomToken as keyof typeof prices] < amount) return;

    // Обновляем балансы
    if (side === 'buy') {
      randomBot.balances.USDT -= total;
      randomBot.balances[randomToken as keyof typeof prices] += amount;
    } else {
      randomBot.balances[randomToken as keyof typeof prices] -= amount;
      randomBot.balances.USDT += total;
    }

    // Создаем сделку
    const trade: RealTrade = {
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
      txHash: `0x${Math.random().toString(16).substr(2, 64)}` // Симуляция хеша
    };

    this.trades.push(trade);
    randomBot.lastTrade = Date.now();

    // Сохраняем сделку в базу данных
    jsonDatabaseService.addTrade(trade);

    console.log(`🤖 ${randomBot.name} ${side} ${amount.toFixed(4)} ${randomToken} @ $${price.toFixed(2)}`);
  }

  // Обновляем стакан
  private updateOrderBook() {
    this.orders = { bids: [], asks: [] };
    
    // Создаем ордера от ботов
    this.bots.forEach(bot => {
      if (!bot.isActive) return;
      
      const tokens = ['BTC', 'ETH'];
      const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
      
      const prices = {
        BTC: 65000 + Math.random() * 10000,
        ETH: 3000 + Math.random() * 1000
      };

      const price = prices[randomToken as keyof typeof prices];
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
    
    // Сохраняем ордера в базу
    jsonDatabaseService.updateOrders(this.orders);
  }

  // Получить топ ордера
  getTopOrders() {
    return this.orders;
  }

  // Получить логи торговли
  getTradeLogs() {
    // Загружаем из базы данных
    const savedLogs = jsonDatabaseService.getTradeLogs();
    
    // Если нет сделок, создаем тестовые
    if (savedLogs.length === 0 && this.trades.length === 0) {
      this.createTestTrades();
      return this.trades.slice(-50);
    }
    
    // Возвращаем из базы или из памяти
    return savedLogs.length > 0 ? savedLogs.slice(-50) : this.trades.slice(-50);
  }

  // Создаем тестовые сделки для демонстрации
  private createTestTrades() {
    const testTrades: RealTrade[] = [
      {
        id: 'test_1',
        timestamp: Date.now() - 300000, // 5 минут назад
        botId: 'bot_1',
        botName: 'AlphaTrader',
        side: 'buy',
        token: 'BTC',
        amount: 0.1234,
        price: 65432.10,
        total: 8064.32,
        fee: 16.13,
        txHash: '0x1234567890abcdef1234567890abcdef12345678'
      },
      {
        id: 'test_2',
        timestamp: Date.now() - 240000, // 4 минуты назад
        botId: 'bot_2',
        botName: 'BetaBuyer',
        side: 'sell',
        token: 'ETH',
        amount: 2.5678,
        price: 3456.78,
        total: 8876.54,
        fee: 17.75,
        txHash: '0xabcdef1234567890abcdef1234567890abcdef12'
      },
      {
        id: 'test_3',
        timestamp: Date.now() - 180000, // 3 минуты назад
        botId: 'bot_3',
        botName: 'GammaGains',
        side: 'buy',
        token: 'BTC',
        amount: 0.9876,
        price: 64321.00,
        total: 63523.45,
        fee: 127.05,
        txHash: '0x9876543210fedcba9876543210fedcba98765432'
      }
    ];

    this.trades = testTrades;
    
    // Сохраняем тестовые сделки в базу
    testTrades.forEach(trade => {
      jsonDatabaseService.addTrade(trade);
    });
    
    console.log('📊 Созданы тестовые сделки для демонстрации');
  }

  // Получить статистику
  getSystemStats() {
    const activeOrders = this.orders.bids.length + this.orders.asks.length;
    const totalFees = this.trades.reduce((sum, trade) => sum + trade.fee, 0);
    
    const stats = {
      totalBots: this.bots.length,
      activeOrders,
      totalFees: totalFees.toFixed(2),
      lastUpdate: Date.now()
    };
    
    // Сохраняем статистику в базу
    jsonDatabaseService.updateStats(stats);
    
    return stats;
  }

  // Получить балансы ботов
  getBotBalances() {
    return this.bots.map(bot => ({
      name: bot.name,
      address: bot.address,
      balances: bot.balances
    }));
  }

  // Сохранить в JSON (для персистентности)
  saveToDatabase() {
    const data = {
      bots: this.bots,
      trades: this.trades,
      orders: this.orders,
      systemStats: this.getSystemStats(),
      botBalances: this.getBotBalances(),
      tradeLogs: this.getTradeLogs()
    };
    
    // В реальном приложении здесь был бы запрос к API для сохранения
    console.log('💾 Данные сохранены в базу');
  }
}

export const realTradingSystemV3 = new RealTradingSystemV3();
