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
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface BotWallet {
  address: string;
  privateKey: string;
  balances: { [token: string]: number };
  name: string;
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
 * Реальная торговая система с TradingView данными и комиссиями
 */
export class RealTradingEngine {
  public provider: ethers.providers.Provider | null = null;
  public signer: ethers.Signer | null = null;
  private bots: BotWallet[] = [];
  private tradeLogs: TradeLog[] = [];
  private orderBook: { [pair: string]: { bids: OrderBookEntry[], asks: OrderBookEntry[] } } = {};
  private isRunning = false;
  private feeWallet = '0xB468B3837e185B59594A100c1583a98C79b524F3';
  private feePercentage = 0.002; // 0.2%

  async initialize(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    this.createBotWallets();
    this.startTrading();
    
    console.log('✅ Real trading engine initialized');
  }

  /**
   * Создаем кошельки для ботов с разными токенами
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
      // Генерируем уникальный адрес для каждого бота
      const wallet = ethers.Wallet.createRandom();
      
      const bot: BotWallet = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        name: botNames[i],
        balances: {
          USDT: Math.random() * 50000 + 10000, // 10k-60k USDT
          BTC: Math.random() * 5 + 0.5, // 0.5-5.5 BTC
          ETH: Math.random() * 50 + 5 // 5-55 ETH
        }
      };
      
      this.bots.push(bot);
    }

    console.log(`🤖 Created ${this.bots.length} bot wallets with diverse token holdings`);
  }

  /**
   * Запускаем торговлю ботов
   */
  private startTrading() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Каждые 3-7 секунд боты создают новые ордера
    setInterval(() => {
      this.generateBotOrders();
    }, Math.random() * 4000 + 3000);

    // Каждые 2-5 секунд исполняем совпадающие ордера
    setInterval(() => {
      this.executeMatches();
    }, Math.random() * 3000 + 2000);

    console.log('🚀 Real trading engine started!');
  }

  /**
   * Генерируем ордера от ботов на основе TradingView данных
   */
  private async generateBotOrders() {
    const pairs = ['BTC/USDT', 'ETH/USDT'];
    
    pairs.forEach(pair => {
      const [base, quote] = pair.split('/');
      const currentPrice = this.getTradingViewPrice(base);
      
      // Выбираем случайных ботов
      const numBots = Math.floor(Math.random() * 8) + 3; // 3-10 ботов
      const selectedBots = this.bots.sort(() => 0.5 - Math.random()).slice(0, numBots);
      
      selectedBots.forEach(bot => {
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = this.generateAmount(bot, base);
        const price = this.generatePriceAroundTradingView(currentPrice, side);
        
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
   * Получаем цену из TradingView (симуляция реальных данных)
   */
  private getTradingViewPrice(token: string): number {
    // В реальности здесь был бы API TradingView
    const basePrices = {
      'BTC': 110000,
      'ETH': 3000,
      'USDT': 1
    };
    
    // Добавляем небольшую волатильность
    const basePrice = basePrices[token as keyof typeof basePrices] || 1;
    const volatility = (Math.random() - 0.5) * 0.02; // ±1%
    
    return basePrice * (1 + volatility);
  }

  /**
   * Генерируем цену вокруг TradingView цены
   */
  private generatePriceAroundTradingView(tradingViewPrice: number, side: 'buy' | 'sell'): number {
    const spread = Math.random() * 0.01 + 0.005; // 0.5-1.5% спред
    
    if (side === 'buy') {
      return tradingViewPrice * (1 - spread);
    } else {
      return tradingViewPrice * (1 + spread);
    }
  }

  /**
   * Генерируем количество для ордера
   */
  private generateAmount(bot: BotWallet, token: string): number {
    const maxAmount = bot.balances[token] * 0.15; // Максимум 15% от баланса
    return Math.random() * maxAmount;
  }

  /**
   * Проверяем, может ли бот торговать
   */
  private canBotTrade(bot: BotWallet, side: 'buy' | 'sell', token: string, amount: number, price: number): boolean {
    if (side === 'buy') {
      return bot.balances.USDT >= amount * price;
    } else {
      return bot.balances[token] >= amount;
    }
  }

  /**
   * Исполняем совпадающие ордера
   */
  private async executeMatches() {
    const pairs = ['BTC/USDT', 'ETH/USDT'];
    
    for (const pair of pairs) {
      const orderBook = this.orderBook[pair];
      if (!orderBook) continue;
      
      // Находим совпадающие ордера
      const matches = this.findMatches(orderBook);
      
      for (const match of matches) {
        await this.executeTrade(match.buyOrder, match.sellOrder);
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
          break; // Один матч на покупку
        }
      }
    }
    
    return matches.slice(0, 10); // Максимум 10 матчей за раз
  }

  /**
   * Исполняем сделку между ботами
   */
  private async executeTrade(buyOrder: OrderBookEntry, sellOrder: OrderBookEntry) {
    const buyBot = this.bots.find(b => b.address === buyOrder.botId);
    const sellBot = this.bots.find(b => b.address === sellOrder.botId);
    
    if (!buyBot || !sellBot) return;
    
    const amount = Math.min(buyOrder.amount, sellOrder.amount);
    const price = sellOrder.price; // Используем цену продавца
    const totalValue = amount * price;
    const fee = totalValue * this.feePercentage;
    
    // Обновляем балансы ботов
    buyBot.balances.USDT -= totalValue;
    buyBot.balances[buyOrder.token] += amount;
    
    sellBot.balances.USDT += totalValue - fee;
    sellBot.balances[sellOrder.token] -= amount;
    
    // Помечаем ордера как исполненные
    buyOrder.filled = true;
    sellOrder.filled = true;
    
    // Создаем лог сделки
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
    
    console.log(`💰 Trade executed: ${amount.toFixed(6)} ${buyOrder.token} @ $${price.toFixed(2)} (Fee: $${fee.toFixed(2)})`);
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
   * Получаем топ 9 ордеров для отображения
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
      .slice(0, 100); // Последние 100 сделок
  }

  /**
   * Получаем статистику системы
   */
  getSystemStats() {
    const activeOrders = Object.values(this.orderBook)
      .reduce((sum, book) => sum + book.bids.filter(o => !o.filled).length + book.asks.filter(o => !o.filled).length, 0);
    
    const totalFees = this.tradeLogs.reduce((sum, log) => sum + log.fee, 0);
    
    return {
      totalBots: this.bots.length,
      activeOrders,
      totalTrades: this.tradeLogs.length,
      totalFees: totalFees,
      feeWallet: this.feeWallet
    };
  }
}

export const realTradingEngine = new RealTradingEngine();
