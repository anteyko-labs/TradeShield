// TradingView integration for professional trading interface
export interface TradingViewSymbol {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
  session: string;
  timezone: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  currency_code: string;
  original_name: string;
}

export interface TradingViewQuote {
  ch: number;
  chp: number;
  short_name: string;
  exchange: string;
  description: string;
  lp: number;
  ask: number;
  bid: number;
  open_price: number;
  high_price: number;
  low_price: number;
  prev_close_price: number;
  volume: number;
  original_name: string;
}

export interface TradingViewConfig {
  width: number;
  height: number;
  symbol: string;
  interval: string;
  timezone: string;
  theme: 'light' | 'dark';
  style: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  locale: string;
  toolbar_bg: string;
  enable_publishing: boolean;
  hide_side_toolbar: boolean;
  allow_symbol_change: boolean;
  details: boolean;
  hotlist: boolean;
  calendar: boolean;
  studies: string[];
  container_id: string;
}

// TradingView API endpoints
const TRADINGVIEW_API_BASE = 'https://symbol-search.tradingview.com';
const TRADINGVIEW_QUOTES_API = 'https://scanner.tradingview.com';

// Get symbol search results
export const searchSymbols = async (query: string): Promise<TradingViewSymbol[]> => {
  try {
    const response = await fetch(`${TRADINGVIEW_API_BASE}/symbol_search/?text=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`TradingView API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error searching symbols:', error);
    return getMockSymbols();
  }
};

// Get real-time quotes
export const getQuotes = async (symbols: string[]): Promise<TradingViewQuote[]> => {
  try {
    const symbolsParam = symbols.join(',');
    const response = await fetch(`${TRADINGVIEW_QUOTES_API}/crypto/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: [
          {
            left: 'name',
            operation: 'match',
            right: symbolsParam
          }
        ],
        columns: [
          'name',
          'close',
          'change',
          'change_abs',
          'volume',
          'market_cap_basic',
          'price_earnings_ttm',
          'earnings_per_share_basic_ttm',
          'number_of_employees',
          'sector',
          'industry',
          'market_cap_basic',
          'price_earnings_ttm',
          'earnings_per_share_basic_ttm',
          'number_of_employees',
          'sector',
          'industry'
        ],
        sort: {
          sortBy: 'market_cap_basic',
          sortOrder: 'desc'
        },
        range: [0, 100]
      })
    });
    
    if (!response.ok) {
      throw new Error(`TradingView API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return getMockQuotes();
  }
};

// Create TradingView widget configuration
export const createTradingViewConfig = (
  symbol: string,
  containerId: string,
  options: Partial<TradingViewConfig> = {}
): TradingViewConfig => {
  return {
    width: 980,
    height: 610,
    symbol: symbol,
    interval: '1',
    timezone: 'Etc/UTC',
    theme: 'dark',
    style: '1',
    locale: 'en',
    toolbar_bg: '#1e1e1e',
    enable_publishing: false,
    hide_side_toolbar: false,
    allow_symbol_change: true,
    details: true,
    hotlist: true,
    calendar: true,
    studies: [
      'Volume@tv-basicstudies',
      'RSI@tv-basicstudies',
      'MACD@tv-basicstudies',
      'MA@tv-basicstudies',
      'EMA@tv-basicstudies',
      'BB@tv-basicstudies',
      'Stochastic@tv-basicstudies',
      'Williams%R@tv-basicstudies',
      'ATR@tv-basicstudies',
      'ADX@tv-basicstudies',
      'CCI@tv-basicstudies',
      'MACD@tv-basicstudies',
      'RSI@tv-basicstudies',
      'Stochastic@tv-basicstudies',
      'Williams%R@tv-basicstudies',
      'ATR@tv-basicstudies',
      'ADX@tv-basicstudies',
      'CCI@tv-basicstudies'
    ],
    container_id: containerId,
    ...options
  };
};

// Create ticker widget configuration
export const createTickerConfig = (
  symbols: string[],
  containerId: string,
  options: any = {}
) => {
  return {
    symbols: symbols.map(symbol => ({
      proName: symbol,
      title: symbol
    })),
    showSymbolLogo: true,
    colorTheme: 'dark',
    isTransparent: false,
    displayMode: 'adaptive',
    locale: 'en',
    container_id: containerId,
    ...options
  };
};

// Create market overview widget configuration
export const createMarketOverviewConfig = (
  containerId: string,
  options: any = {}
) => {
  return {
    colorTheme: 'dark',
    dateRange: '12M',
    showChart: true,
    locale: 'en',
    largeChartUrl: '',
    isTransparent: false,
    showSymbolLogo: true,
    showFloatingTooltip: false,
    width: '100%',
    height: '400',
    plotLineColorGrowing: 'rgba(33, 150, 243, 1)',
    plotLineColorFalling: 'rgba(33, 150, 243, 1)',
    gridLineColor: 'rgba(240, 243, 250, 0)',
    scaleFontColor: 'rgba(120, 123, 134, 1)',
    belowLineFillColorGrowing: 'rgba(33, 150, 243, 0.12)',
    belowLineFillColorFalling: 'rgba(33, 150, 243, 0.12)',
    belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
    belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
    symbolActiveColor: 'rgba(33, 150, 243, 0.12)',
    container_id: containerId,
    ...options
  };
};

// Mock data for development
const getMockSymbols = (): TradingViewSymbol[] => {
  return [
    {
      symbol: 'BTCUSD',
      full_name: 'BTCUSD',
      description: 'Bitcoin',
      exchange: 'BINANCE',
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      currency_code: 'USD',
      original_name: 'BTCUSD'
    },
    {
      symbol: 'ETHUSD',
      full_name: 'ETHUSD',
      description: 'Ethereum',
      exchange: 'BINANCE',
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      currency_code: 'USD',
      original_name: 'ETHUSD'
    }
  ];
};

const getMockQuotes = (): TradingViewQuote[] => {
  return [
    {
      ch: 2.45,
      chp: 0.0567,
      short_name: 'BTC',
      exchange: 'BINANCE',
      description: 'Bitcoin',
      lp: 110203 + (Math.random() - 0.5) * 2000,
      ask: 43255.00,
      bid: 43245.00,
      open_price: 42500.00,
      high_price: 43800.00,
      low_price: 42000.00,
      prev_close_price: 42500.00,
      volume: 1200000000,
      original_name: 'BTCUSD'
    },
    {
      ch: -1.23,
      chp: -0.0432,
      short_name: 'ETH',
      exchange: 'BINANCE',
      description: 'Ethereum',
      lp: 2845.80 + (Math.random() - 0.5) * 100,
      ask: 2850.00,
      bid: 2840.00,
      open_price: 2900.00,
      high_price: 2950.00,
      low_price: 2800.00,
      prev_close_price: 2900.00,
      volume: 856000000,
      original_name: 'ETHUSD'
    }
  ];
};
