// Price service for real-time data
export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface TradingPair {
  id: string;
  base: string;
  quote: string;
  price: number;
  change: number;
  volume: string;
  high24h: number;
  low24h: number;
}

// Mock data for demo (in real app, you'd use CoinGecko, CoinMarketCap, or DEX APIs)
export const getTokenPrices = async (): Promise<TokenPrice[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      symbol: 'ETH',
      price: 2845.80,
      change24h: -1.23,
      volume24h: 856000000,
      marketCap: 342000000000,
    },
    {
      symbol: 'BTC',
      price: 43250.50,
      change24h: 2.45,
      volume24h: 1200000000,
      marketCap: 850000000000,
    },
    {
      symbol: 'TSD',
      price: 1.05,
      change24h: 5.67,
      volume24h: 45000000,
      marketCap: 105000000,
    },
    {
      symbol: 'TSP',
      price: 0.85,
      change24h: 3.21,
      volume24h: 23000000,
      marketCap: 85000000,
    },
  ];
};

export const getTradingPairs = async (): Promise<TradingPair[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: 'ETH/USDT',
      base: 'ETH',
      quote: 'USDT',
      price: 2845.80,
      change: -1.23,
      volume: '856M',
      high24h: 2890.50,
      low24h: 2810.20,
    },
    {
      id: 'BTC/USDT',
      base: 'BTC',
      quote: 'USDT',
      price: 43250.50,
      change: 2.45,
      volume: '1.2B',
      high24h: 43800.00,
      low24h: 42500.00,
    },
    {
      id: 'TSD/USDT',
      base: 'TSD',
      quote: 'USDT',
      price: 1.05,
      change: 5.67,
      volume: '45M',
      high24h: 1.08,
      low24h: 0.98,
    },
    {
      id: 'TSP/USDT',
      base: 'TSP',
      quote: 'USDT',
      price: 0.85,
      change: 3.21,
      volume: '23M',
      high24h: 0.88,
      low24h: 0.82,
    },
  ];
};

// Real-time price updates (simulated)
export const subscribeToPriceUpdates = (
  callback: (prices: TokenPrice[]) => void
): (() => void) => {
  const interval = setInterval(async () => {
    const prices = await getTokenPrices();
    // Add some random variation to simulate real-time updates
    const updatedPrices = prices.map(price => ({
      ...price,
      price: price.price * (1 + (Math.random() - 0.5) * 0.01), // ±0.5% variation
      change24h: price.change24h + (Math.random() - 0.5) * 0.5, // ±0.25% change variation
    }));
    callback(updatedPrices);
  }, 3000); // Update every 3 seconds

  return () => clearInterval(interval);
};

// Get historical data for charts
export const getHistoricalData = async (
  symbol: string,
  timeframe: '1h' | '4h' | '1d' = '1h'
): Promise<Array<{ timestamp: number; price: number; volume: number }>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = Date.now();
  const interval = timeframe === '1h' ? 3600000 : timeframe === '4h' ? 14400000 : 86400000;
  const points = 24;
  
  const data = [];
  let basePrice = 100;
  
  for (let i = points; i >= 0; i--) {
    const timestamp = now - (i * interval);
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const price = basePrice * (1 + variation);
    const volume = Math.random() * 1000000;
    
    data.push({
      timestamp,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(volume),
    });
    
    basePrice = price;
  }
  
  return data;
};
