import { ethers } from 'ethers';

// Адреса токенов
const TOKEN_ADDRESSES = {
  USDT: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// ABI для токенов
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function transferFrom(address,address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)"
];

interface BotOrder {
  id: string;
  botId: string;
  side: 'buy' | 'sell';
  token: string;
  amount: number;
  price: number;
  timestamp: number;
  filled: boolean;
  size: number;
  total: number;
}

interface Bot {
  id: string;
  name: string;
  balance: { [key: string]: number };
  orders: BotOrder[];
  tradingStyle: 'aggressive' | 'conservative' | 'scalper';
}

/**
 * Сервис торговых ботов для создания ликвидности
 */
export class TradingBotService {
  public provider: ethers.providers.Provider | null = null;
  public signer: ethers.Signer | null = null;
  private bots: Bot[] = [];
  private orderBook: { [pair: string]: { bids: BotOrder[], asks: BotOrder[] } } = {};
  private isRunning = false;

  async initialize(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.createBots();
    this.startTrading();
  }

  /**
   * Создаем 40 торговых ботов
   */
  private createBots() {
    const botNames = [
      'AlphaTrader', 'BetaBot', 'GammaGamer', 'DeltaDex', 'EpsilonExchange',
      'ZetaZone', 'EtaEngine', 'ThetaTrader', 'IotaInvestor', 'KappaKeeper',
      'LambdaLiquidity', 'MuMaker', 'NuNexus', 'XiXchange', 'OmicronOrder',
      'PiPump', 'RhoRally', 'SigmaScalper', 'TauTrader', 'UpsilonUp',
      'PhiFlipper', 'ChiChanger', 'PsiPump', 'OmegaOrder', 'AlphaArb',
      'BetaBuyer', 'GammaGains', 'DeltaDump', 'EpsilonEarn', 'ZetaZone',
      'EtaEarn', 'ThetaTrade', 'IotaInvest', 'KappaKeep', 'LambdaLiquidity',
      'MuMarket', 'NuNetwork', 'XiXchange', 'OmicronOrder', 'PiProfit'
    ];

    for (let i = 0; i < 40; i++) {
      const bot: Bot = {
        id: `bot_${i}`,
        name: botNames[i],
        balance: {
          USDT: Math.random() * 100000 + 10000, // 10k-110k USDT
          BTC: Math.random() * 10 + 0.1, // 0.1-10.1 BTC
          ETH: Math.random() * 100 + 1 // 1-101 ETH
        },
        orders: [],
        tradingStyle: ['aggressive', 'conservative', 'scalper'][Math.floor(Math.random() * 3)] as any
      };
      this.bots.push(bot);
    }

    console.log(`🤖 Created ${this.bots.length} trading bots`);
  }

  /**
   * Запускаем торговлю ботов
   */
  private startTrading() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Каждые 2-5 секунд боты создают новые ордера
    setInterval(() => {
      this.generateBotOrders();
    }, Math.random() * 3000 + 2000);

    // Каждые 1-3 секунды боты исполняют ордера
    setInterval(() => {
      this.executeBotTrades();
    }, Math.random() * 2000 + 1000);

    console.log('🚀 Trading bots started!');
  }

  /**
   * Генерируем ордера от ботов
   */
  private generateBotOrders() {
    const pairs = ['BTC/USDT', 'ETH/USDT'];
    
    pairs.forEach(pair => {
      const [base, quote] = pair.split('/');
      const currentPrice = this.getCurrentPrice(base);
      
      // Выбираем случайных ботов для создания ордеров
      const numBots = Math.floor(Math.random() * 5) + 2; // 2-6 ботов
      const selectedBots = this.bots.sort(() => 0.5 - Math.random()).slice(0, numBots);
      
      selectedBots.forEach(bot => {
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = this.generateAmount(bot, base);
        const price = this.generatePrice(currentPrice, side, bot.tradingStyle);
        
        if (this.canBotTrade(bot, side, base, amount, price)) {
          const order: BotOrder = {
            id: `order_${Date.now()}_${Math.random()}`,
            botId: bot.id,
            side,
            token: base,
            amount,
            price,
            timestamp: Date.now(),
            filled: false,
            size: amount,
            total: amount * price
          };
          
          bot.orders.push(order);
          this.addToOrderBook(pair, order);
          
          console.log(`🤖 ${bot.name} placed ${side} order: ${amount.toFixed(6)} ${base} @ $${price.toFixed(2)} (Size: ${amount.toFixed(6)}, Total: $${(amount * price).toFixed(2)})`);
        }
      });
    });
    
    // Очищаем старые исполненные ордера (старше 30 секунд)
    this.cleanupOldOrders();
  }

  /**
   * Исполняем торговлю между ботами
   */
  private executeBotTrades() {
    const pairs = ['BTC/USDT', 'ETH/USDT'];
    
    pairs.forEach(pair => {
      const orderBook = this.orderBook[pair];
      if (!orderBook) return;
      
      // Находим совпадающие ордера
      orderBook.bids.forEach(bid => {
        orderBook.asks.forEach(ask => {
          if (bid.price >= ask.price && !bid.filled && !ask.filled) {
            this.executeTrade(bid, ask);
          }
        });
      });
    });
  }

  /**
   * Исполняем сделку между ботами
   */
  private executeTrade(bid: BotOrder, ask: BotOrder) {
    const bidBot = this.bots.find(b => b.id === bid.botId);
    const askBot = this.bots.find(b => b.id === ask.botId);
    
    if (!bidBot || !askBot) return;
    
    const amount = Math.min(bid.amount, ask.amount);
    const price = ask.price; // Используем цену продавца
    
    // Обновляем балансы ботов
    bidBot.balance.USDT -= amount * price;
    bidBot.balance[bid.token] += amount;
    
    askBot.balance.USDT += amount * price;
    askBot.balance[ask.token] -= amount;
    
    // Помечаем ордера как исполненные
    bid.filled = true;
    ask.filled = true;
    
    console.log(`💰 Bot trade: ${amount} ${bid.token} @ $${price} (${bidBot.name} ↔ ${askBot.name})`);
  }

  /**
   * Генерируем цену для ордера
   */
  private generatePrice(currentPrice: number, side: 'buy' | 'sell', style: string): number {
    let spread = 0;
    
    switch (style) {
      case 'aggressive':
        spread = Math.random() * 0.02; // 0-2%
        break;
      case 'conservative':
        spread = Math.random() * 0.05 + 0.02; // 2-7%
        break;
      case 'scalper':
        spread = Math.random() * 0.01; // 0-1%
        break;
    }
    
    if (side === 'buy') {
      return currentPrice * (1 - spread);
    } else {
      return currentPrice * (1 + spread);
    }
  }

  /**
   * Генерируем количество для ордера
   */
  private generateAmount(bot: Bot, token: string): number {
    const maxAmount = bot.balance[token] * 0.1; // Максимум 10% от баланса
    return Math.random() * maxAmount;
  }

  /**
   * Проверяем, может ли бот торговать
   */
  private canBotTrade(bot: Bot, side: 'buy' | 'sell', token: string, amount: number, price: number): boolean {
    if (side === 'buy') {
      return bot.balance.USDT >= amount * price;
    } else {
      return bot.balance[token] >= amount;
    }
  }

  /**
   * Получаем текущую цену токена
   */
  private getCurrentPrice(token: string): number {
    // Используем реальные цены или фиксированные
    switch (token) {
      case 'BTC': return 110000;
      case 'ETH': return 3000;
      default: return 1;
    }
  }

  /**
   * Добавляем ордер в стакан
   */
  private addToOrderBook(pair: string, order: BotOrder) {
    if (!this.orderBook[pair]) {
      this.orderBook[pair] = { bids: [], asks: [] };
    }
    
    if (order.side === 'buy') {
      this.orderBook[pair].bids.push(order);
    } else {
      this.orderBook[pair].asks.push(order);
    }
    
    // Сортируем стакан
    this.orderBook[pair].bids.sort((a, b) => b.price - a.price);
    this.orderBook[pair].asks.sort((a, b) => a.price - b.price);
  }

  /**
   * Получаем стакан для отображения
   */
  getOrderBook(pair: string): { bids: BotOrder[], asks: BotOrder[] } {
    return this.orderBook[pair] || { bids: [], asks: [] };
  }

  /**
   * Очищаем старые ордера
   */
  private cleanupOldOrders() {
    const now = Date.now();
    const maxAge = 30000; // 30 секунд
    
    this.bots.forEach(bot => {
      bot.orders = bot.orders.filter(order => {
        const isOld = now - order.timestamp > maxAge;
        if (isOld) {
          console.log(`🗑️ Removing old order from ${bot.name}: ${order.side} ${order.amount} ${order.token}`);
        }
        return !isOld;
      });
    });
    
    // Очищаем стакан от старых ордеров
    Object.keys(this.orderBook).forEach(pair => {
      this.orderBook[pair].bids = this.orderBook[pair].bids.filter(order => now - order.timestamp <= maxAge);
      this.orderBook[pair].asks = this.orderBook[pair].asks.filter(order => now - order.timestamp <= maxAge);
    });
  }

  /**
   * Получаем статистику ботов
   */
  getBotStats() {
    const activeOrders = this.bots.reduce((sum, bot) => sum + bot.orders.filter(o => !o.filled).length, 0);
    const totalVolume = this.bots.reduce((sum, bot) => sum + bot.balance.USDT, 0);
    
    console.log(`📊 Bot Stats: ${this.bots.length} bots, ${activeOrders} active orders, $${totalVolume.toFixed(2)} total volume`);
    
    return {
      totalBots: this.bots.length,
      activeOrders,
      totalVolume
    };
  }
}

export const tradingBotService = new TradingBotService();
