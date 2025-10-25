import { TokenBalance, TradingPosition } from '../hooks/useTrading';

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  amount: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  timestamp: number;
  filledAmount?: number;
  averagePrice?: number;
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  fee: number;
}

export interface AdvancedTradingState {
  balances: TokenBalance[];
  positions: TradingPosition[];
  orders: Order[];
  trades: Trade[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export class AdvancedTradingService {
  private state: AdvancedTradingState = {
    balances: [],
    positions: [],
    orders: [],
    trades: [],
    totalValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0
  };

  private listeners: Array<(state: AdvancedTradingState) => void> = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    this.state.balances = [
      { symbol: 'USDT', balance: 10000, decimals: 6 },
      { symbol: 'BTC', balance: 0.5, decimals: 8 },
      { symbol: 'ETH', balance: 2.0, decimals: 18 },
      { symbol: 'TSD', balance: 5000, decimals: 18 },
      { symbol: 'TSP', balance: 10000, decimals: 18 },
    ];
    this.updateTotalValue();
    this.notifyListeners();
  }

  subscribe(listener: (state: AdvancedTradingState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): AdvancedTradingState {
    return { ...this.state };
  }

  getBalance(symbol: string): number {
    const token = this.state.balances.find(b => b.symbol === symbol);
    return token ? token.balance : 0;
  }

  canSell(symbol: string, amount: number): boolean {
    const balance = this.getBalance(symbol);
    return balance >= amount;
  }

  canBuy(symbol: string, amount: number, price: number): boolean {
    const usdtBalance = this.getBalance('USDT');
    const totalCost = amount * price;
    return usdtBalance >= totalCost;
  }

  async createOrder(
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop',
    amount: number,
    price?: number,
    stopPrice?: number
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // Validation
      if (amount <= 0) {
        return { success: false, error: 'Amount must be greater than 0' };
      }

      if (type === 'limit' && (!price || price <= 0)) {
        return { success: false, error: 'Price is required for limit orders' };
      }

      if (type === 'stop' && (!stopPrice || stopPrice <= 0)) {
        return { success: false, error: 'Stop price is required for stop orders' };
      }

      // Check balances
      if (side === 'sell') {
        if (!this.canSell(symbol, amount)) {
          return { 
            success: false, 
            error: `Insufficient ${symbol} balance. You have ${this.getBalance(symbol)} ${symbol}` 
          };
        }
      } else {
        const tradePrice = price || this.getCurrentPrice(symbol);
        if (!this.canBuy(symbol, amount, tradePrice)) {
          const usdtBalance = this.getBalance('USDT');
          const required = amount * tradePrice;
          return { 
            success: false, 
            error: `Insufficient USDT balance. You have ${usdtBalance} USDT, need ${required} USDT` 
          };
        }
      }

      // Create order
      const order: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        side,
        type,
        amount,
        price,
        stopPrice,
        status: 'pending',
        timestamp: Date.now()
      };

      this.state.orders.push(order);
      this.notifyListeners();

      // Execute market orders immediately
      if (type === 'market') {
        await this.executeOrder(order);
      }

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: 'Failed to create order' };
    }
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const orderIndex = this.state.orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) {
        return { success: false, error: 'Order not found' };
      }

      const order = this.state.orders[orderIndex];
      if (order.status !== 'pending') {
        return { success: false, error: 'Order cannot be cancelled' };
      }

      this.state.orders[orderIndex].status = 'cancelled';
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { success: false, error: 'Failed to cancel order' };
    }
  }

  private async executeOrder(order: Order) {
    try {
      const currentPrice = this.getCurrentPrice(order.symbol);
      const tradePrice = order.type === 'limit' ? order.price! : currentPrice;
      const fee = tradePrice * order.amount * 0.001; // 0.1% fee

      // Update balances
      if (order.side === 'sell') {
        // Sell token, get USDT
        this.updateBalance(order.symbol, -order.amount);
        this.updateBalance('USDT', order.amount * tradePrice - fee);
      } else {
        // Buy token, spend USDT
        this.updateBalance('USDT', -(order.amount * tradePrice + fee));
        this.updateBalance(order.symbol, order.amount);
      }

      // Create trade record
      const trade: Trade = {
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        amount: order.amount,
        price: tradePrice,
        timestamp: Date.now(),
        fee
      };

      this.state.trades.push(trade);

      // Update order status
      const orderIndex = this.state.orders.findIndex(o => o.id === order.id);
      if (orderIndex !== -1) {
        this.state.orders[orderIndex].status = 'filled';
        this.state.orders[orderIndex].filledAmount = order.amount;
        this.state.orders[orderIndex].averagePrice = tradePrice;
      }

      // Update positions
      this.updatePositions(order.symbol, order.amount, tradePrice, order.side);

      this.updateTotalValue();
      this.notifyListeners();
    } catch (error) {
      console.error('Error executing order:', error);
      // Mark order as rejected
      const orderIndex = this.state.orders.findIndex(o => o.id === order.id);
      if (orderIndex !== -1) {
        this.state.orders[orderIndex].status = 'rejected';
      }
      this.notifyListeners();
    }
  }

  private updateBalance(symbol: string, delta: number) {
    const balanceIndex = this.state.balances.findIndex(b => b.symbol === symbol);
    if (balanceIndex !== -1) {
      this.state.balances[balanceIndex].balance += delta;
    } else {
      this.state.balances.push({ symbol, balance: delta, decimals: 18 });
    }
  }

  private updatePositions(symbol: string, amount: number, price: number, side: 'buy' | 'sell') {
    const positionIndex = this.state.positions.findIndex(p => p.symbol === symbol);
    
    if (positionIndex !== -1) {
      const position = this.state.positions[positionIndex];
      if (side === 'buy') {
        // Increase position
        const newAmount = position.amount + amount;
        const newEntryPrice = (position.entryPrice * position.amount + price * amount) / newAmount;
        this.state.positions[positionIndex] = {
          ...position,
          amount: newAmount,
          entryPrice: newEntryPrice,
          currentPrice: price
        };
      } else {
        // Decrease position
        const newAmount = position.amount - amount;
        if (newAmount <= 0) {
          this.state.positions.splice(positionIndex, 1);
        } else {
          this.state.positions[positionIndex] = {
            ...position,
            amount: newAmount,
            currentPrice: price
          };
        }
      }
    } else if (side === 'buy') {
      // Create new position
      this.state.positions.push({
        symbol,
        amount,
        entryPrice: price,
        currentPrice: price,
        pnl: 0,
        pnlPercent: 0
      });
    }
  }

  private getCurrentPrice(symbol: string): number {
    // Mock prices - in real app, get from price feed
    const mockPrices: { [key: string]: number } = {
      'BTC': 110000,
      'ETH': 3200,
      'TSD': 1.05,
      'TSP': 0.85
    };
    return mockPrices[symbol] || 1;
  }

  private updateTotalValue() {
    this.state.totalValue = this.state.balances.reduce((total, token) => {
      const price = this.getCurrentPrice(token.symbol);
      return total + (token.balance * price);
    }, 0);

    this.state.totalPnl = this.state.positions.reduce((total, position) => {
      const currentPrice = this.getCurrentPrice(position.symbol);
      const pnl = (currentPrice - position.entryPrice) * position.amount;
      return total + pnl;
    }, 0);

    this.state.totalPnlPercent = this.state.totalValue > 0 ? 
      (this.state.totalPnl / this.state.totalValue) * 100 : 0;
  }

  // MEV Protection methods
  getMEVProtectionStatus(): {
    enabled: boolean;
    privateMempool: boolean;
    commitReveal: boolean;
    antiSandwich: boolean;
    slippageProtection: boolean;
  } {
    return {
      enabled: true,
      privateMempool: true,
      commitReveal: true,
      antiSandwich: true,
      slippageProtection: true
    };
  }

  setMEVProtection(settings: {
    privateMempool?: boolean;
    commitReveal?: boolean;
    antiSandwich?: boolean;
    slippageProtection?: boolean;
  }) {
    // In real implementation, this would configure MEV protection
    console.log('MEV Protection settings updated:', settings);
  }
}

export const advancedTradingService = new AdvancedTradingService();
