// CoinGecko API integration for real-time crypto data with proxy
import { cacheService } from './cacheService';
import { rateLimiter } from './rateLimiter';

const COINGECKO_API_URL = '/api/coingecko';
const CACHE_TTL = 300000; // 5 minutes cache
export interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any;
  last_updated: string;
}

// CoinGecko API configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Get real-time prices for multiple cryptocurrencies
export const getRealTimePrices = async (): Promise<CoinGeckoData[]> => {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoData[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    return getStaticFallbackData();
  }
};

// Get specific coins by IDs with improved caching
export const getCoinsByIds = async (ids: string[]): Promise<CoinGeckoData[]> => {
  const cacheKey = `coingecko_${ids.join(',')}`;
  
  // Check cache first
  const cachedData = cacheService.get<CoinGeckoData[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached CoinGecko data');
    return cachedData;
  }

  // Check rate limiter
  if (!rateLimiter.canMakeRequest('coingecko')) {
    console.log('Rate limited by rate limiter, using fallback data');
    return getStaticFallbackData();
  }

  try {
    const idsString = ids.join(',');
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${idsString}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d`
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.log('Rate limited by CoinGecko API, using fallback data');
        return getStaticFallbackData();
      }
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoData[] = await response.json();
    
    // Cache the data for 5 minutes
    cacheService.set(cacheKey, data, 300000);
    return data;
  } catch (error) {
    console.error('Error fetching specific coins from CoinGecko:', error);
    return getStaticFallbackData();
  }
};

// Get trending cryptocurrencies
export const getTrendingCoins = async (): Promise<CoinGeckoData[]> => {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/search/trending`);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.coins.map((coin: any) => coin.item);
  } catch (error) {
    console.error('Error fetching trending coins from CoinGecko:', error);
    return getStaticFallbackData();
  }
};

// Get global market data
export const getGlobalMarketData = async () => {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/global`);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching global market data from CoinGecko:', error);
    return {
      total_market_cap: { usd: 2500000000000 },
      total_volume: { usd: 100000000000 },
      market_cap_percentage: { btc: 42.5, eth: 18.2 },
      active_cryptocurrencies: 10000,
      markets: 1000
    };
  }
};

// Static fallback data (last resort)
const getStaticFallbackData = (): CoinGeckoData[] => {
  return [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 110203,
      market_cap: 1300000000000,
      market_cap_rank: 1,
      fully_diluted_valuation: 1400000000000,
      total_volume: 25000000000,
      high_24h: 68000,
      low_24h: 65000,
      price_change_24h: 1500,
      price_change_percentage_24h: 2.5,
      market_cap_change_24h: 30000000000,
      market_cap_change_percentage_24h: 2.5,
      circulating_supply: 19500000,
      total_supply: 19500000,
      max_supply: 21000000,
      ath: 69000,
      ath_change_percentage: -2.9,
      ath_date: '2021-11-10T14:24:11.849Z',
      atl: 67.81,
      atl_change_percentage: 98700.0,
      atl_date: '2013-07-06T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString()
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 3200,
      market_cap: 380000000000,
      market_cap_rank: 2,
      fully_diluted_valuation: 380000000000,
      total_volume: 15000000000,
      high_24h: 3250,
      low_24h: 3150,
      price_change_24h: -40,
      price_change_percentage_24h: -1.2,
      market_cap_change_24h: -5000000000,
      market_cap_change_percentage_24h: -1.2,
      circulating_supply: 120000000,
      total_supply: 120000000,
      max_supply: null,
      ath: 4800,
      ath_change_percentage: -33.3,
      ath_date: '2021-11-10T14:24:11.849Z',
      atl: 0.432979,
      atl_change_percentage: 739000.0,
      atl_date: '2015-10-20T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString()
    }
  ];
};
