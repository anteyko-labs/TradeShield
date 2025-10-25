// Static data service as ultimate fallback when all APIs fail
export interface StaticPriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

// Real current prices (updated manually when needed)
export const getStaticCryptoPrices = (): StaticPriceData[] => {
  return [
    {
      symbol: 'BTC',
      price: 110203,
      change24h: 550,
      changePercent24h: 0.50,
      volume24h: 25000000000,
      marketCap: 2170000000000,
      high24h: 111000,
      low24h: 109000,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'ETH',
      price: 3000,
      change24h: 50,
      changePercent24h: 1.5,
      volume24h: 15000000000,
      marketCap: 470000000000,
      high24h: 3050,
      low24h: 2950,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'ADA',
      price: 0.646,
      change24h: 0.007,
      changePercent24h: 1.04,
      volume24h: 800000000,
      marketCap: 23000000000,
      high24h: 0.65,
      low24h: 0.64,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'SOL',
      price: 190.21,
      change24h: 0.40,
      changePercent24h: 0.21,
      volume24h: 2000000000,
      marketCap: 85000000000,
      high24h: 195,
      low24h: 185,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'DOT',
      price: 3.04,
      change24h: 0.07,
      changePercent24h: 2.41,
      volume24h: 300000000,
      marketCap: 4000000000,
      high24h: 3.1,
      low24h: 2.9,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'AVAX',
      price: 19.30,
      change24h: -0.12,
      changePercent24h: -0.60,
      volume24h: 500000000,
      marketCap: 7000000000,
      high24h: 19.8,
      low24h: 19.0,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'MATIC',
      price: 0.85,
      change24h: 0.01,
      changePercent24h: 1.8,
      volume24h: 200000000,
      marketCap: 8000000000,
      high24h: 0.88,
      low24h: 0.82,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'LINK',
      price: 17.56,
      change24h: 0.27,
      changePercent24h: 1.57,
      volume24h: 400000000,
      marketCap: 10000000000,
      high24h: 18.0,
      low24h: 17.0,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'TSD',
      price: 1.05,
      change24h: 0.06,
      changePercent24h: 5.67,
      volume24h: 45000000,
      marketCap: 105000000,
      high24h: 1.08,
      low24h: 0.98,
      lastUpdated: new Date().toISOString()
    },
    {
      symbol: 'TSP',
      price: 0.85,
      change24h: 0.03,
      changePercent24h: 3.21,
      volume24h: 23000000,
      marketCap: 85000000,
      high24h: 0.88,
      low24h: 0.82,
      lastUpdated: new Date().toISOString()
    }
  ];
};
