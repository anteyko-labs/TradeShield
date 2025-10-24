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
    console.warn('CoinMarketCap API key not found, using CoinGecko fallback');
    return await getCoinGeckoFallback(symbols);
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
    return await getCoinGeckoFallback(symbols);
  }
};

// CoinGecko fallback (free, no API key needed)
const getCoinGeckoFallback = async (symbols: string[]): Promise<CMCData[]> => {
  try {
    // Map symbols to CoinGecko IDs
    const symbolToId: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'ADA': 'cardano',
      'SOL': 'solana',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'MATIC': 'polygon',
      'LINK': 'chainlink'
    };

    const ids = symbols.map(symbol => symbolToId[symbol]).filter(Boolean);
    const idsString = ids.join(',');
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    return symbols.map((symbol, index) => {
      const id = symbolToId[symbol];
      const coinData = data[id];
      
      return {
        id: index + 1,
        name: symbol === 'BTC' ? 'Bitcoin' : 
              symbol === 'ETH' ? 'Ethereum' :
              symbol === 'ADA' ? 'Cardano' :
              symbol === 'SOL' ? 'Solana' :
              symbol === 'DOT' ? 'Polkadot' :
              symbol === 'AVAX' ? 'Avalanche' :
              symbol === 'MATIC' ? 'Polygon' :
              symbol === 'LINK' ? 'Chainlink' : symbol,
        symbol: symbol,
        slug: symbol.toLowerCase(),
        cmc_rank: index + 1,
        num_market_pairs: 1000,
        circulating_supply: 1000000,
        total_supply: 1000000,
        max_supply: null,
        last_updated: new Date().toISOString(),
        date_added: new Date().toISOString(),
        tags: ['crypto'],
        platform: null,
        quote: {
          USD: {
            price: coinData?.usd || 0,
            volume_24h: coinData?.usd_24h_vol || 0,
            volume_change_24h: 0,
            percent_change_1h: 0,
            percent_change_24h: coinData?.usd_24h_change || 0,
            percent_change_7d: 0,
            market_cap: coinData?.usd_market_cap || 0,
            market_cap_dominance: 0,
            fully_diluted_market_cap: 0,
            last_updated: new Date().toISOString(),
          }
        }
      };
    });
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    return getStaticFallbackData();
  }
};

// Static fallback data (last resort)
const getStaticFallbackData = (): CMCData[] => {
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
          price: 110203,
          volume_24h: 25000000000,
          volume_change_24h: 5.2,
          percent_change_1h: 0.5,
          percent_change_24h: 2.5,
          percent_change_7d: -1.2,
          market_cap: 1300000000000,
          market_cap_dominance: 42.5,
          fully_diluted_market_cap: 1400000000000,
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
          price: 3200,
          volume_24h: 15000000000,
          volume_change_24h: -2.1,
          percent_change_1h: -0.3,
          percent_change_24h: -1.2,
          percent_change_7d: 3.8,
          market_cap: 380000000000,
          market_cap_dominance: 18.2,
          fully_diluted_market_cap: 380000000000,
          last_updated: new Date().toISOString(),
        },
      },
    }
  ];
};