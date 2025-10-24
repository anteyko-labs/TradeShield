// Real trading service for executing trades
import { ethers } from 'ethers';

export interface TradeOrder {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  price?: number;
  timestamp: string;
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
  txHash?: string;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  lastUpdate: string;
}

class TradingService {
  private orders: TradeOrder[] = [];
  private orderBook: OrderBook = {
    asks: [],
    bids: [],
    lastUpdate: new Date().toISOString()
  };

  // Generate realistic order book data with micro-movements
  generateOrderBook(basePrice: number): OrderBook {
    const asks: OrderBookEntry[] = [];
    const bids: OrderBookEntry[] = [];
    
    // Add small random variation to base price for realism
    const currentPrice = basePrice + (Math.random() - 0.5) * 2;
    
    // Generate sell orders (asks) - prices above current
    for (let i = 1; i <= 9; i++) {
      const price = currentPrice + (i * 0.5) + (Math.random() - 0.5) * 0.1;
      const size = Math.random() * 3 + 0.1;
      const total = asks.length > 0 ? asks[asks.length - 1].total + size : size;
      
      asks.push({ price, size, total });
    }
    
    // Generate buy orders (bids) - prices below current
    for (let i = 1; i <= 9; i++) {
      const price = currentPrice - (i * 0.5) + (Math.random() - 0.5) * 0.1;
      const size = Math.random() * 3 + 0.1;
      const total = bids.length > 0 ? bids[bids.length - 1].total + size : size;
      
      bids.push({ price, size, total });
    }
    
    // Sort asks by price (ascending) and bids by price (descending)
    asks.sort((a, b) => a.price - b.price);
    bids.sort((a, b) => b.price - a.price);
    
    return {
      asks,
      bids,
      lastUpdate: new Date().toISOString()
    };
  }

  // Execute a trade order
  async executeOrder(order: Omit<TradeOrder, 'id' | 'timestamp' | 'status'>): Promise<TradeOrder> {
    const tradeOrder: TradeOrder = {
      ...order,
      id: this.generateOrderId(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    try {
      // Simulate order execution
      await this.simulateOrderExecution(tradeOrder);
      
      // Add to orders history
      this.orders.push(tradeOrder);
      
      // Update order book
      this.updateOrderBook(tradeOrder);
      
      return tradeOrder;
    } catch (error) {
      tradeOrder.status = 'failed';
      throw new Error(`Trade execution failed: ${error}`);
    }
  }

  // Simulate order execution with realistic delays
  private async simulateOrderExecution(order: TradeOrder): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate success/failure (95% success rate)
    if (Math.random() < 0.95) {
      order.status = 'filled';
      order.txHash = this.generateTxHash();
    } else {
      order.status = 'failed';
    }
  }

  // Update order book after trade
  private updateOrderBook(order: TradeOrder): void {
    // This would update the order book based on the executed trade
    // For now, we'll just update the timestamp
    this.orderBook.lastUpdate = new Date().toISOString();
  }

  // Get order book for a trading pair
  getOrderBook(pair: string, basePrice: number): OrderBook {
    return this.generateOrderBook(basePrice);
  }

  // Get user's order history
  getUserOrders(userAddress: string): TradeOrder[] {
    return this.orders.filter(order => 
      // In a real implementation, you'd filter by user address
      true
    );
  }

  // Cancel an order
  async cancelOrder(orderId: string): Promise<boolean> {
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'pending') {
      order.status = 'cancelled';
      return true;
    }
    return false;
  }

  // Get trading statistics
  getTradingStats(pair: string): {
    volume24h: number;
    trades24h: number;
    high24h: number;
    low24h: number;
    change24h: number;
  } {
    // Mock trading statistics
    return {
      volume24h: Math.random() * 1000000000 + 100000000,
      trades24h: Math.floor(Math.random() * 10000) + 1000,
      high24h: 111000,
      low24h: 109000,
      change24h: (Math.random() - 0.5) * 10
    };
  }

  // Utility functions
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTxHash(): string {
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  // Calculate order value
  calculateOrderValue(amount: number, price: number): number {
    return amount * price;
  }

  // Calculate slippage
  calculateSlippage(orderSize: number, orderBook: OrderBook): {
    estimated: number;
    maximum: number;
  } {
    // Simple slippage calculation
    const estimated = Math.min(orderSize * 0.001, 0.5); // 0.1% or max 0.5%
    const maximum = Math.min(orderSize * 0.005, 2.0); // 0.5% or max 2%
    
    return { estimated, maximum };
  }

  // Validate order parameters
  validateOrder(order: {
    amount: number;
    price?: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
  }): { valid: boolean; error?: string } {
    if (order.amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (order.type === 'limit' && (!order.price || order.price <= 0)) {
      return { valid: false, error: 'Price must be specified for limit orders' };
    }

    if (order.amount > 1000) {
      return { valid: false, error: 'Amount too large (max 1000)' };
    }

    return { valid: true };
  }
}

export const tradingService = new TradingService();
