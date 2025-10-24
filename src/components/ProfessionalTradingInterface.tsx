import React, { useState, useEffect } from 'react';
import { Wallet, Star } from 'lucide-react';
import { Button } from './Button';
import { useWeb3 } from '../providers/RealWeb3Provider';
import { useRealData } from '../hooks/useRealData';
import { CleanTradingViewWidget } from './CleanTradingViewWidget';
import { tradingService } from '../services/tradingService';
import { useTrading } from '../hooks/useTrading';
import { Portfolio } from './Portfolio';

interface TradingPair {
  id: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  high24h: number;
  low24h: number;
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export const ProfessionalTradingInterface: React.FC = () => {
  const { address } = useWeb3();
  const { tradingPairs } = useRealData();
  const { 
    portfolio, 
    createOrder, 
    cancelOrder, 
    updatePrices
  } = useTrading(address);
  
  // State for trading
  const [selectedPair] = useState<TradingPair | null>(null);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [showPortfolio, setShowPortfolio] = useState(false);
  
  // Mock order book data
  const [orderBook, setOrderBook] = useState<{
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
  }>({
    asks: [
      { price: 110203.5, size: 0.5, total: 0.5 },
      { price: 110204.0, size: 1.2, total: 1.7 },
      { price: 110204.5, size: 0.8, total: 2.5 },
      { price: 110205.0, size: 2.1, total: 4.6 },
      { price: 110205.5, size: 1.5, total: 6.1 },
    ],
    bids: [
      { price: 110203.0, size: 1.8, total: 1.8 },
      { price: 110202.5, size: 2.3, total: 4.1 },
      { price: 110202.0, size: 1.1, total: 5.2 },
      { price: 110201.5, size: 3.2, total: 8.4 },
      { price: 110201.0, size: 1.9, total: 10.3 },
    ]
  });

  // Real data fallback with current prices
  const mockPairs: TradingPair[] = [
    { id: 'BTC/USDT', name: 'BTC/USDT', price: 110203, change: 0.52, volume: '25B', high24h: 111000, low24h: 109000 },
    { id: 'ETH/USDT', name: 'ETH/USDT', price: 3907.59, change: 1.47, volume: '15B', high24h: 3950, low24h: 3850 },
    { id: 'ADA/USDT', name: 'ADA/USDT', price: 0.646, change: 1.04, volume: '800M', high24h: 0.65, low24h: 0.64 },
    { id: 'SOL/USDT', name: 'SOL/USDT', price: 190.21, change: 0.21, volume: '2B', high24h: 195, low24h: 185 },
    { id: 'DOT/USDT', name: 'DOT/USDT', price: 3.04, change: 2.41, volume: '300M', high24h: 3.1, low24h: 2.9 },
    { id: 'AVAX/USDT', name: 'AVAX/USDT', price: 19.30, change: -0.60, volume: '500M', high24h: 19.8, low24h: 19.0 },
    { id: 'MATIC/USDT', name: 'MATIC/USDT', price: 0.85, change: 1.8, volume: '200M', high24h: 0.88, low24h: 0.82 },
    { id: 'LINK/USDT', name: 'LINK/USDT', price: 17.56, change: 1.57, volume: '400M', high24h: 18.0, low24h: 17.0 },
  ];

  const displayPairs = tradingPairs.length > 0 ? tradingPairs : mockPairs;
  const currentPair = selectedPair || displayPairs[0];

  // Update order book and prices every 500ms for fast updates
  useEffect(() => {
    const updateOrderBook = () => {
      const newOrderBook = tradingService.getOrderBook(currentPair?.id || 'BTC/USDT', currentPair?.price || 0);
      setOrderBook(newOrderBook);
      
      // Update prices for trading engine
      if (currentPair) {
        updatePrices({
          [currentPair.id]: currentPair.price
        });
      }
    };

    updateOrderBook();
    const interval = setInterval(updateOrderBook, 500);

    return () => clearInterval(interval);
  }, [currentPair, updatePrices]);

  // Real trading functions
  const executeTrade = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      alert('Please enter a valid price for limit order');
      return;
    }

    try {
      const result = await createOrder(
        currentPair?.id || 'BTC/USDT',
        side,
        orderType,
        parseFloat(amount),
        orderType === 'limit' ? parseFloat(price) : undefined
      );

      if (result.success) {
        alert(`Order created successfully: ${side.toUpperCase()} ${amount} ${currentPair?.id}`);
        // Reset form
        setAmount('');
        setPrice('');
      } else {
        alert(`Order failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Trade execution failed:', error);
      alert('Trade execution failed. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 3, 
      maximumFractionDigits: 3 
    });
  };

  const formatSize = (size: number) => {
    return size.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatTotal = (total: number) => {
    return total.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-semibold">BTC/USDT</span>
              <span className="text-sm text-gray-400">Spot</span>
            </div>
            
            <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">{formatPrice(currentPair?.price || 110203)}</div>
              <div className={`text-sm font-semibold ${currentPair?.change && currentPair.change >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {currentPair?.change && currentPair.change >= 0 ? '+' : ''}{currentPair?.change?.toFixed(2)}%
              </div>
            </div>
              
              <div className="text-sm text-gray-400">
                <div>24h Volume: ${formatVolume(Number(currentPair?.volume) || 25000000000)}</div>
                <div>Market Cap: $2.17T</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Trading Balance: ${portfolio ? portfolio.availableBalance.toFixed(2) : '0.00'}
            </div>
            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              {showPortfolio ? 'Hide' : 'Portfolio'}
            </button>
            <Button variant="secondary" size="small">
              <Wallet className="w-4 h-4 mr-2" />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect'}
            </Button>
          </div>
        </div>
      </div>

      {/* Portfolio Display */}
      {showPortfolio && portfolio && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <Portfolio
            positions={portfolio.positions}
            orders={portfolio.orders}
            trades={portfolio.trades}
            totalBalance={portfolio.totalBalance}
            availableBalance={portfolio.availableBalance}
            totalPnl={portfolio.totalPnl}
            totalPnlPercent={portfolio.totalPnlPercent}
            onCancelOrder={cancelOrder}
          />
        </div>
      )}

      {/* Main Trading Interface - Full Width Layout */}
      <div className="flex-1 flex">
        {/* Main Chart Area - Left Column - Only TradingView */}
        <div className="flex-1 flex flex-col">
          {/* Chart - Full Height - Only TradingView */}
          <div className="flex-1 bg-gray-900 relative">
            <CleanTradingViewWidget
              symbol="BINANCE:BTCUSDT"
              height={650}
            />
          </div>
        </div>

        {/* Order Book - Center Column - Full Height */}
        <div className="w-60 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
          <div className="p-3 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-400 text-sm">Order Book</h3>
              <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white">
                <option>0.001</option>
                <option>0.01</option>
                <option>0.1</option>
              </select>
            </div>
          </div>
          
          <div className="p-3 space-y-1 flex-1 overflow-y-auto">
            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-2">
              <div className="text-right">Price</div>
              <div className="text-right">Size</div>
              <div className="text-right">Total</div>
            </div>
            
            {/* Sell Orders */}
            {orderBook.asks.map((ask, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-gray-700 cursor-pointer py-1 px-1 rounded relative">
                {/* Red background gradient for sell orders */}
                <div 
                  className="absolute inset-0 bg-red-500 opacity-5 rounded"
                  style={{ width: `${(ask.total / 30) * 100}%` }}
                />
                <span className="text-right text-red-400 font-mono relative z-10">{formatPrice(ask.price)}</span>
                <span className="text-right text-gray-300 font-mono relative z-10">{formatSize(ask.size)}</span>
                <span className="text-right text-gray-400 font-mono relative z-10">{formatTotal(ask.total)}</span>
              </div>
            ))}
            
            {/* Spread */}
            <div className="text-center py-1 text-xs text-gray-400 border-t border-b border-gray-700">
              <div className="flex justify-center items-center space-x-1">
                <span>Spread</span>
                <span className="text-white font-mono">0.001</span>
                <span>(0.003%)</span>
              </div>
            </div>
            
            {/* Buy Orders */}
            {orderBook.bids.map((bid, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-gray-700 cursor-pointer py-1 px-1 rounded relative">
                {/* Green background gradient for buy orders */}
                <div 
                  className="absolute inset-0 bg-green-500 opacity-5 rounded"
                  style={{ width: `${(bid.total / 30) * 100}%` }}
                />
                <span className="text-right text-green-400 font-mono relative z-10">{formatPrice(bid.price)}</span>
                <span className="text-right text-gray-300 font-mono relative z-10">{formatSize(bid.size)}</span>
                <span className="text-right text-gray-400 font-mono relative z-10">{formatTotal(bid.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Panel - Right Column - Reduced Width - No Shutter */}
        <div className="w-60 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
          {/* Top Section - Order Type and Inputs - Flexible Height */}
          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {/* Order Type Tabs */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setOrderType('market')}
                      className={`px-2 py-1 rounded text-xs ${
                        orderType === 'market'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Market
                    </button>
                    <button
                      onClick={() => setOrderType('limit')}
                      className={`px-2 py-1 rounded text-xs ${
                        orderType === 'limit'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Limit
                    </button>
                  </div>

            {/* Buy/Sell Buttons - Moved Back Up */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSide('buy')}
                className={`py-2 rounded font-semibold text-sm ${
                  side === 'buy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide('sell')}
                className={`py-2 rounded font-semibold text-sm ${
                  side === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Amount Input - Fixed Width */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Size</label>
              <div className="flex w-full">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-l px-2 py-1 text-white text-sm min-w-0"
                />
                <select className="bg-gray-700 border border-gray-600 rounded-r px-1 text-white text-sm w-16">
                  <option>BTC</option>
                  <option>USDT</option>
                </select>
              </div>
            </div>

            {/* Price Input (for limit orders) */}
            {orderType === 'limit' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
              </div>
            )}

            {/* Percentage Slider */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Percentage</label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-700 rounded p-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Order Value:</span>
                <span className="text-white">
                  {amount && currentPair ? 
                    `$${(parseFloat(amount) * currentPair.price).toFixed(2)}` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Slippage:</span>
                <span className="text-white">Est: 0% / Max: 8.00%</span>
              </div>
            </div>
          </div>

          {/* Bottom Section - Execute Button Fixed at Bottom */}
          <div className="p-3 border-t border-gray-700 flex-shrink-0" style={{ paddingBottom: 'calc(0.75rem + 5px)' }}>
            {/* Execute Trade Button - Main Button at Bottom */}
            <button
              onClick={executeTrade}
              className={`w-full py-3 rounded font-semibold text-sm mb-2 ${
                side === 'buy'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {side === 'buy' ? 'Buy' : 'Sell'} BTC/USDT
            </button>

            {/* Connect Wallet Button */}
            {!address && (
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-sm">
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-2 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Online
          </span>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-white">Docs</a>
          <a href="#" className="hover:text-white">Support</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};
