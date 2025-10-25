import { ethers } from 'ethers';

// Фиксированные токены - НЕ МЕНЯЮТСЯ!
const FIXED_TOKENS = {
  USDT: { symbol: 'USDT', decimals: 6, totalSupply: 1000000000 }, // 1B USDT
  BTC: { symbol: 'BTC', decimals: 8, totalSupply: 21000000 }, // 21M BTC
  ETH: { symbol: 'ETH', decimals: 18, totalSupply: 120000000 } // 120M ETH
};

interface BotWallet {
  address: string;
  name: string;
  balances: { [token: string]: number };
  privateKey: string;
}

interface TradeLog {
  id: string;
  timestamp: number;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: number;
  price: number;
  totalValue: number;
  fee: number;
  status: 'completed';
}

interface OrderBookEntry {
  id: string;
  botId: string;
  side: 'buy' | 'sell';
  token: string;
  amount: number;
  price: number;
  total: number;
  timestamp: number;
  filled: boolean;
}

/**
 * РЕАЛЬНАЯ торговая система с фиксированными токенами
 */
export class RealTradingSystemV2 {
  private bots: BotWallet[] = [];
  private tradeLogs: TradeLog[] = [];
  private orderBook: { [pair: string]: { bids: OrderBookEntry[], asks: OrderBookEntry[] } } = {};
  private isRunning = false;
  private feeWallet = '0xB468B3837e185B59594A100c1583a98C79b524F3';
  private feePercentage = 0.002; // 0.2%
  private totalFees = 0;

  /**
   * Инициализация системы
   */
  async initialize() {
    this.createBotWallets();
    this.distributeTokens();
    this.startTrading();
    console.log('✅ Real Trading System V2 initialized');
  }

  /**
   * Создаем кошельки для ботов
   */
  private createBotWallets() {
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
      const wallet = ethers.Wallet.createRandom();
      
      const bot: BotWallet = {
        address: wallet.address,
        name: botNames[i],
        privateKey: wallet.privateKey,
        balances: {
          USDT: 0,
          BTC: 0,
          ETH: 0
        }
      };
      
      this.bots.push(bot);
    }

    console.log(`🤖 Created ${this.bots.length} bot wallets`);
  }

  /**
   * Распределяем токены между ботами (ФИКСИРОВАННОЕ количество)
   */
  private distributeTokens() {
    // Распределяем USDT (1B общий объем)
    const totalUSDT = 1000000000;
    const usdtPerBot = totalUSDT / this.bots.length;
    
    // Распределяем BTC (21M общий объем)
    const totalBTC = 21000000;
    const btcPerBot = totalBTC / this.bots.length;
    
    // Распределяем ETH (120M общий объем)
    const totalETH = 120000000;
    const ethPerBot = totalETH / this.bots.length;

    this.bots.forEach(bot => {
      bot.balances.USDT = usdtPerBot;
      bot.balances.BTC = btcPerBot;
      bot.balances.ETH = ethPerBot;
    });

    console.log(`💰 Distributed tokens: ${usdtPerBot.toFixed(0)} USDT, ${btcPerBot.toFixed(0)} BTC, ${ethPerBot.toFixed(0)} ETH per bot`);
  }

  /**
   * Запускаем торговлю
   */
  private startTrading() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Каждые 3-7 секунд создаем ордера
    setInterval(() => {
      this.generateOrders();
    }, Math.random() * 4000 + 3000);

    // Каждые 2-5 секунд исполняем сделки
    setInterval(() => {
      this.executeTrades();
    }, Math.random() * 3000 + 2000);

    console.log('🚀 Real trading started!');
  }

  /**
   * Генерируем ордера от ботов
   */
  private generateOrders() {
    const pairs = ['BTC/USDT', 'ETH/USDT'];
    
    pairs.forEach(pair => {
      const [base, quote] = pair.split('/');
      const currentPrice = this.getCurrentPrice(base);
      
      // Выбираем 3-8 случайных ботов
      const numBots = Math.floor(Math.random() * 6) + 3;
      const selectedBots = this.bots.sort(() => 0.5 - Math.random()).slice(0, numBots);
      
      selectedBots.forEach(bot => {
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = this.generateAmount(bot, base);
        const price = this.generatePrice(currentPrice, side);
        
        if (this.canBotTrade(bot, side, base, amount, price)) {
          const order: OrderBookEntry = {
            id: `order_${Date.now()}_${Math.random()}`,
            botId: bot.address,
            side,
            token: base,
            amount,
            price,
            total: amount * price,
            timestamp: Date.now(),
            filled: false
          };
          
          this.addToOrderBook(pair, order);
          
          console.log(`🤖 ${bot.name} placed ${side} order: ${amount.toFixed(6)} ${base} @ $${price.toFixed(2)}`);
        }
      });
    });
  }

  /**
   * Получаем текущую цену (симуляция TradingView)
   */
  private getCurrentPrice(token: string): number {
    const basePrices = {
      'BTC': 110000,
      'ETH': 3000,
      'USDT': 1
    };
    
    const basePrice = basePrices[token as keyof typeof basePrices] || 1;
    const volatility = (Math.random() - 0.5) * 0.01; // ±0.5%
    
    return basePrice * (1 + volatility);
  }

  /**
   * Генерируем цену вокруг текущей
   */
  private generatePrice(currentPrice: number, side: 'buy' | 'sell'): number {
    const spread = Math.random() * 0.005 + 0.002; // 0.2-0.7% спред
    
    if (side === 'buy') {
      return currentPrice * (1 - spread);
    } else {
      return currentPrice * (1 + spread);
    }
  }

  /**
   * Генерируем количество
   */
  private generateAmount(bot: BotWallet, token: string): number {
    const maxAmount = bot.balances[token] * 0.1; // Максимум 10% от баланса
    return Math.random() * maxAmount;
  }

  /**
   * Проверяем возможность торговли
   */
  private canBotTrade(bot: BotWallet, side: 'buy' | 'sell', token: string, amount: number, price: number): boolean {
    if (side === 'buy') {
      return bot.balances.USDT >= amount * price;
    } else {
      return bot.balances[token] >= amount;
    }
  }

  /**
   * Исполняем сделки
   */
  private executeTrades() {
    const pairs = ['BTC/USDT', 'ETH/USDT'];
    
    for (const pair of pairs) {
      const orderBook = this.orderBook[pair];
      if (!orderBook) continue;
      
      // Находим совпадающие ордера
      const matches = this.findMatches(orderBook);
      
      for (const match of matches) {
        this.executeTrade(match.buyOrder, match.sellOrder);
      }
    }
  }

  /**
   * Находим совпадающие ордера
   */
  private findMatches(orderBook: { bids: OrderBookEntry[], asks: OrderBookEntry[] }) {
    const matches = [];
    
    for (const bid of orderBook.bids) {
      if (bid.filled) continue;
      
      for (const ask of orderBook.asks) {
        if (ask.filled) continue;
        
        if (bid.price >= ask.price) {
          matches.push({
            buyOrder: bid,
            sellOrder: ask
          });
          break;
        }
      }
    }
    
    return matches.slice(0, 5); // Максимум 5 матчей
  }

  /**
   * Исполняем сделку
   */
  private executeTrade(buyOrder: OrderBookEntry, sellOrder: OrderBookEntry) {
    const buyBot = this.bots.find(b => b.address === buyOrder.botId);
    const sellBot = this.bots.find(b => b.address === sellOrder.botId);
    
    if (!buyBot || !sellBot) return;
    
    const amount = Math.min(buyOrder.amount, sellOrder.amount);
    const price = sellOrder.price;
    const totalValue = amount * price;
    const fee = totalValue * this.feePercentage;
    
    // Обновляем балансы
    buyBot.balances.USDT -= totalValue;
    buyBot.balances[buyOrder.token] += amount;
    
    sellBot.balances.USDT += totalValue - fee;
    sellBot.balances[sellOrder.token] -= amount;
    
    // Накапливаем комиссию
    this.totalFees += fee;
    
    // Помечаем ордера как исполненные
    buyOrder.filled = true;
    sellOrder.filled = true;
    
    // Создаем лог
    const tradeLog: TradeLog = {
      id: `trade_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      fromAddress: sellBot.address,
      toAddress: buyBot.address,
      token: buyOrder.token,
      amount,
      price,
      totalValue,
      fee,
      status: 'completed'
    };
    
    this.tradeLogs.push(tradeLog);
    
    console.log(`💰 Trade: ${amount.toFixed(6)} ${buyOrder.token} @ $${price.toFixed(2)} (Fee: $${fee.toFixed(2)})`);
  }

  /**
   * Добавляем ордер в стакан
   */
  private addToOrderBook(pair: string, order: OrderBookEntry) {
    if (!this.orderBook[pair]) {
      this.orderBook[pair] = { bids: [], asks: [] };
    }
    
    if (order.side === 'buy') {
      this.orderBook[pair].bids.push(order);
      this.orderBook[pair].bids.sort((a, b) => b.price - a.price);
    } else {
      this.orderBook[pair].asks.push(order);
      this.orderBook[pair].asks.sort((a, b) => a.price - b.price);
    }
  }

  /**
   * Получаем топ ордера
   */
  getTopOrders(pair: string): { bids: OrderBookEntry[], asks: OrderBookEntry[] } {
    const orderBook = this.orderBook[pair] || { bids: [], asks: [] };
    
    return {
      bids: orderBook.bids
        .filter(o => !o.filled)
        .slice(0, 9)
        .sort((a, b) => b.price - a.price),
      asks: orderBook.asks
        .filter(o => !o.filled)
        .slice(0, 9)
        .sort((a, b) => a.price - b.price)
    };
  }

  /**
   * Получаем логи торговли
   */
  getTradeLogs(): TradeLog[] {
    return this.tradeLogs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
  }

  /**
   * Получаем статистику
   */
  getSystemStats() {
    const activeOrders = Object.values(this.orderBook)
      .reduce((sum, book) => sum + book.bids.filter(o => !o.filled).length + book.asks.filter(o => !o.filled).length, 0);
    
    return {
      totalBots: this.bots.length,
      activeOrders,
      totalTrades: this.tradeLogs.length,
      totalFees: this.totalFees,
      feeWallet: this.feeWallet
    };
  }

  /**
   * Получаем балансы ботов
   */
  getBotBalances() {
    return this.bots.map(bot => ({
      name: bot.name,
      address: bot.address,
      balances: { ...bot.balances }
    }));
  }
}

export const realTradingSystemV2 = new RealTradingSystemV2();
