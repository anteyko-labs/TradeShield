// CoinMarketCap API integration for real-time crypto data
export interface CMCQuote {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  last_updated: string;
}

export interface CMCData {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: any;
  quote: {
    USD: CMCQuote;
  };
}

export interface CMCResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
  data: CMCData[];
}

// CoinMarketCap API configuration
const CMC_API_BASE = 'https://pro-api.coinmarketcap.com/v1';
const CMC_API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY;

// Headers for API requests
const getHeaders = () => ({
  'X-CMC_PRO_API_KEY': CMC_API_KEY,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
});

// Get latest quotes for specific cryptocurrencies
export const getLatestQuotes = async (symbols: string[]): Promise<CMCData[]> => {
  if (!CMC_API_KEY) {
    console.warn('CoinMarketCap API key not found, using mock data');
    return getMockData();
  }

  try {
    const symbolString = symbols.join(',');
    const response = await fetch(
      `${CMC_API_BASE}/cryptocurrency/quotes/latest?symbol=${symbolString}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.status} ${response.statusText}`);
    }

    const data: CMCResponse = await response.json();
    
    if (data.status.error_code !== 0) {
      throw new Error(`CMC API error: ${data.status.error_message}`);
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching from CoinMarketCap:', error);
    return getMockData();
  }
};

// Get historical data for charts
export const getHistoricalData = async (
  symbol: string,
  timeStart: string,
  timeEnd: string
): Promise<any[]> => {
  if (!CMC_API_KEY) {
    console.warn('CoinMarketCap API key not found, using mock data');
    return getMockHistoricalData(symbol);
  }

  try {
    const response = await fetch(
      `${CMC_API_BASE}/cryptocurrency/quotes/historical?symbol=${symbol}&time_start=${timeStart}&time_end=${timeEnd}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching historical data from CMC:', error);
    return getMockHistoricalData(symbol);
  }
};

// Get trending cryptocurrencies
export const getTrending = async (): Promise<CMCData[]> => {
  if (!CMC_API_KEY) {
    console.warn('CoinMarketCap API key not found, using mock data');
    return getMockData();
  }

  try {
    const response = await fetch(
      `${CMC_API_BASE}/cryptocurrency/trending/latest`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.status} ${response.statusText}`);
    }

    const data: CMCResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching trending from CMC:', error);
    return getMockData();
  }
};

// Mock data fallback when API key is not available
const getMockData = (): CMCData[] => {
  return [
    {
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      slug: 'bitcoin',
      cmc_rank: 1,
      num_market_pairs: 10000,
      circulating_supply: 19500000,
      total_supply: 19500000,
      max_supply: 21000000,
      last_updated: new Date().toISOString(),
      date_added: '2013-04-28T00:00:00.000Z',
      tags: ['mineable', 'pow', 'sha-256', 'store-of-value'],
      platform: null,
      quote: {
        USD: {
          price: 43250.50 + (Math.random() - 0.5) * 1000,
          volume_24h: 1200000000,
          volume_change_24h: 5.2,
          percent_change_1h: 0.5,
          percent_change_24h: 2.45,
          percent_change_7d: -1.2,
          market_cap: 850000000000,
          market_cap_dominance: 42.5,
          fully_diluted_market_cap: 900000000000,
          last_updated: new Date().toISOString(),
        },
      },
    },
    {
      id: 1027,
      name: 'Ethereum',
      symbol: 'ETH',
      slug: 'ethereum',
      cmc_rank: 2,
      num_market_pairs: 8000,
      circulating_supply: 120000000,
      total_supply: 120000000,
      max_supply: null,
      last_updated: new Date().toISOString(),
      date_added: '2015-08-07T00:00:00.000Z',
      tags: ['pos', 'smart-contracts', 'ethereum-ecosystem'],
      platform: null,
      quote: {
        USD: {
          price: 2845.80 + (Math.random() - 0.5) * 100,
          volume_24h: 856000000,
          volume_change_24h: -2.1,
          percent_change_1h: -0.3,
          percent_change_24h: -1.23,
          percent_change_7d: 3.8,
          market_cap: 342000000000,
          market_cap_dominance: 18.2,
          fully_diluted_market_cap: 342000000000,
          last_updated: new Date().toISOString(),
        },
      },
    },
    {
      id: 9999,
      name: 'TradeShield Dollar',
      symbol: 'TSD',
      slug: 'tradeshield-dollar',
      cmc_rank: 999,
      num_market_pairs: 5,
      circulating_supply: 100000000,
      total_supply: 100000000,
      max_supply: 100000000,
      last_updated: new Date().toISOString(),
      date_added: new Date().toISOString(),
      tags: ['defi', 'exchange-token'],
      platform: null,
      quote: {
        USD: {
          price: 1.05 + (Math.random() - 0.5) * 0.1,
          volume_24h: 45000000,
          volume_change_24h: 12.5,
          percent_change_1h: 0.8,
          percent_change_24h: 5.67,
          percent_change_7d: 15.2,
          market_cap: 105000000,
          market_cap_dominance: 0.01,
          fully_diluted_market_cap: 105000000,
          last_updated: new Date().toISOString(),
        },
      },
    },
    {
      id: 9998,
      name: 'TradeShield Points',
      symbol: 'TSP',
      slug: 'tradeshield-points',
      cmc_rank: 1000,
      num_market_pairs: 3,
      circulating_supply: 100000000,
      total_supply: 100000000,
      max_supply: 100000000,
      last_updated: new Date().toISOString(),
      date_added: new Date().toISOString(),
      tags: ['defi', 'reward-token'],
      platform: null,
      quote: {
        USD: {
          price: 0.85 + (Math.random() - 0.5) * 0.05,
          volume_24h: 23000000,
          volume_change_24h: 8.3,
          percent_change_1h: 0.2,
          percent_change_24h: 3.21,
          percent_change_7d: 8.7,
          market_cap: 85000000,
          market_cap_dominance: 0.005,
          fully_diluted_market_cap: 85000000,
          last_updated: new Date().toISOString(),
        },
      },
    },
  ];
};

const getMockHistoricalData = (symbol: string) => {
  const now = Date.now();
  const data = [];
  let basePrice = symbol === 'BTC' ? 43000 : symbol === 'ETH' ? 2800 : 1.0;
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = now - (i * 3600000); // 1 hour intervals
    const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
    const price = basePrice * (1 + variation);
    
    data.push({
      timestamp: new Date(timestamp).toISOString(),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
    });
    
    basePrice = price;
  }
  
  return data;
};
