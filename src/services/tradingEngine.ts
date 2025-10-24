// Trading Engine - Real Trading Logic with Persistence
export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
  userAddress: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  size: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: string;
  userAddress: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  timestamp: string;
  userAddress: string;
  orderId: string;
}

export interface Portfolio {
  totalBalance: number;
  availableBalance: number;
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  totalPnl: number;
  totalPnlPercent: number;
}

class TradingEngine {
  private storageKey = 'trading_portfolio';
  private currentPrices: { [symbol: string]: number } = {};

  // Initialize portfolio for user
  initializePortfolio(userAddress: string): Portfolio {
    const portfolio: Portfolio = {
      totalBalance: 10000, // Starting with $10,000
      availableBalance: 10000,
      positions: [],
      orders: [],
      trades: [],
      totalPnl: 0,
      totalPnlPercent: 0
    };
    
    this.savePortfolio(userAddress, portfolio);
    return portfolio;
  }

  // Get portfolio for user
  getPortfolio(userAddress: string): Portfolio {
    const saved = localStorage.getItem(`${this.storageKey}_${userAddress}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return this.initializePortfolio(userAddress);
  }

  // Save portfolio to localStorage
  private savePortfolio(userAddress: string, portfolio: Portfolio): void {
    localStorage.setItem(`${this.storageKey}_${userAddress}`, JSON.stringify(portfolio));
  }

  // Update current prices (called from TradingView data)
  updatePrices(prices: { [symbol: string]: number }): void {
    this.currentPrices = prices;
  }

  // Get current price for symbol
  getCurrentPrice(symbol: string): number {
    return this.currentPrices[symbol] || 0;
  }

  // Create a new order
  createOrder(
    userAddress: string,
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit',
    size: number,
    price?: number
  ): Order {
    const order: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      symbol,
      side,
      type,
      size,
      price,
      status: 'pending',
      timestamp: new Date().toISOString(),
      userAddress
    };

    const portfolio = this.getPortfolio(userAddress);
    portfolio.orders.push(order);
    this.savePortfolio(userAddress, portfolio);

    // If market order, execute immediately
    if (type === 'market') {
      this.executeOrder(userAddress, order.id);
    }

    return order;
  }

  // Execute an order
  executeOrder(userAddress: string, orderId: string): boolean {
    const portfolio = this.getPortfolio(userAddress);
    const order = portfolio.orders.find(o => o.id === orderId);
    
    if (!order || order.status !== 'pending') {
      return false;
    }

    const currentPrice = this.getCurrentPrice(order.symbol);
    if (currentPrice === 0) {
      return false;
    }

    const executionPrice = order.type === 'market' ? currentPrice : (order.price || currentPrice);
    const totalCost = order.size * executionPrice;

    // Check if user has enough balance
    if (order.side === 'buy' && portfolio.availableBalance < totalCost) {
      return false;
    }

    // Execute the trade
    const trade: Trade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      symbol: order.symbol,
      side: order.side,
      size: order.size,
      price: executionPrice,
      timestamp: new Date().toISOString(),
      userAddress,
      orderId: order.id
    };

    // Update portfolio
    if (order.side === 'buy') {
      portfolio.availableBalance -= totalCost;
    } else {
      portfolio.availableBalance += totalCost;
    }

    // Update or create position
    this.updatePosition(portfolio, trade);

    // Update order status
    order.status = 'filled';
    
    // Add trade to history
    portfolio.trades.push(trade);
    
    // Recalculate totals
    this.calculatePortfolioTotals(portfolio);
    
    this.savePortfolio(userAddress, portfolio);
    return true;
  }

  // Update position based on trade
  private updatePosition(portfolio: Portfolio, trade: Trade): void {
    const existingPosition = portfolio.positions.find(p => p.symbol === trade.symbol);
    
    if (existingPosition) {
      if (trade.side === 'buy') {
        // Adding to long position
        const newSize = existingPosition.size + trade.size;
        const newEntryPrice = (existingPosition.entryPrice * existingPosition.size + trade.price * trade.size) / newSize;
        existingPosition.size = newSize;
        existingPosition.entryPrice = newEntryPrice;
      } else {
        // Reducing long position
        existingPosition.size -= trade.size;
        if (existingPosition.size <= 0) {
          // Position closed
          const index = portfolio.positions.indexOf(existingPosition);
          portfolio.positions.splice(index, 1);
        }
      }
    } else {
      // Create new position
      if (trade.side === 'buy') {
        const position: Position = {
          id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          symbol: trade.symbol,
          side: 'long',
          size: trade.size,
          entryPrice: trade.price,
          currentPrice: this.getCurrentPrice(trade.symbol),
          pnl: 0,
          pnlPercent: 0,
          timestamp: trade.timestamp,
          userAddress: trade.userAddress
        };
        portfolio.positions.push(position);
      }
    }
  }

  // Calculate portfolio totals
  private calculatePortfolioTotals(portfolio: Portfolio): void {
    let totalPnl = 0;
    let totalValue = portfolio.availableBalance;

    portfolio.positions.forEach(position => {
      const currentPrice = this.getCurrentPrice(position.symbol);
      position.currentPrice = currentPrice;
      position.pnl = (currentPrice - position.entryPrice) * position.size;
      position.pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      totalPnl += position.pnl;
      totalValue += position.size * currentPrice;
    });

    portfolio.totalPnl = totalPnl;
    portfolio.totalPnlPercent = (totalPnl / (totalValue - totalPnl)) * 100;
    portfolio.totalBalance = totalValue;
  }

  // Cancel an order
  cancelOrder(userAddress: string, orderId: string): boolean {
    const portfolio = this.getPortfolio(userAddress);
    const order = portfolio.orders.find(o => o.id === orderId);
    
    if (!order || order.status !== 'pending') {
      return false;
    }

    order.status = 'cancelled';
    this.savePortfolio(userAddress, portfolio);
    return true;
  }

  // Get open orders
  getOpenOrders(userAddress: string): Order[] {
    const portfolio = this.getPortfolio(userAddress);
    return portfolio.orders.filter(o => o.status === 'pending');
  }

  // Get positions
  getPositions(userAddress: string): Position[] {
    const portfolio = this.getPortfolio(userAddress);
    return portfolio.positions;
  }

  // Get trade history
  getTradeHistory(userAddress: string): Trade[] {
    const portfolio = this.getPortfolio(userAddress);
    return portfolio.trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Update all positions with current prices
  updatePositions(userAddress: string): void {
    const portfolio = this.getPortfolio(userAddress);
    this.calculatePortfolioTotals(portfolio);
    this.savePortfolio(userAddress, portfolio);
  }

  // Get portfolio summary
  getPortfolioSummary(userAddress: string) {
    const portfolio = this.getPortfolio(userAddress);
    return {
      totalBalance: portfolio.totalBalance,
      availableBalance: portfolio.availableBalance,
      totalPnl: portfolio.totalPnl,
      totalPnlPercent: portfolio.totalPnlPercent,
      positionsCount: portfolio.positions.length,
      openOrdersCount: portfolio.orders.filter(o => o.status === 'pending').length
    };
  }
}

export const tradingEngine = new TradingEngine();
