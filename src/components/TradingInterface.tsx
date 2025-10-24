import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { PriceDisplay } from './PriceDisplay';

interface TradingPair {
  id: string;
  name: string;
  price: number;
  change: number;
  volume: string;
}

export const TradingInterface: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  const [pairs, setPairs] = useState<TradingPair[]>([
    { id: 'BTC/USDT', name: 'BTC/USDT', price: 43250.50, change: 2.45, volume: '1.2B' },
    { id: 'ETH/USDT', name: 'ETH/USDT', price: 2845.80, change: -1.23, volume: '856M' },
    { id: 'TSD/USDT', name: 'TSD/USDT', price: 1.05, change: 5.67, volume: '45M' },
    { id: 'TSP/USDT', name: 'TSP/USDT', price: 0.85, change: 3.21, volume: '23M' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prevPairs =>
        prevPairs.map(pair => ({
          ...pair,
          price: pair.price * (1 + (Math.random() - 0.5) * 0.002),
          change: pair.change + (Math.random() - 0.5) * 0.5,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const selectedPairData = pairs.find(p => p.id === selectedPair);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3">
        <Card hover={false}>
          <h3 className="text-lg font-semibold mb-4">Trading Pairs</h3>
          <div className="space-y-2">
            {pairs.map(pair => (
              <button
                key={pair.id}
                onClick={() => setSelectedPair(pair.id)}
                className={`
                  w-full text-left p-3 rounded-lg transition-all duration-200
                  ${selectedPair === pair.id ? 'bg-blue-primary text-white' : 'bg-medium-gray hover:bg-medium-gray/70'}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{pair.name}</span>
                  {pair.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-profit" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-loss" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">${pair.price.toFixed(2)}</span>
                  <span className={`text-xs ${pair.change > 0 ? 'text-green-profit' : 'text-red-loss'}`}>
                    {pair.change > 0 ? '+' : ''}{pair.change.toFixed(2)}%
                  </span>
                </div>
                <div className="text-xs text-text-muted mt-1">Vol: {pair.volume}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="col-span-6">
        <Card hover={false} className="h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedPair}</h2>
              {selectedPairData && (
                <PriceDisplay
                  price={selectedPairData.price.toFixed(2)}
                  change={selectedPairData.change}
                  className="mt-2"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">24h Vol:</span>
              <span className="text-sm font-semibold">{selectedPairData?.volume}</span>
            </div>
          </div>

          <div className="bg-medium-gray rounded-lg p-8 mb-6">
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-text-muted/20 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">Advanced Trading Chart</p>
                <p className="text-sm text-text-muted/60 mt-2">Real-time price data with technical indicators</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-medium-gray rounded-lg p-4">
              <div className="text-xs text-text-muted mb-1">24h High</div>
              <div className="font-mono text-green-profit font-semibold">
                ${selectedPairData && (selectedPairData.price * 1.05).toFixed(2)}
              </div>
            </div>
            <div className="bg-medium-gray rounded-lg p-4">
              <div className="text-xs text-text-muted mb-1">24h Low</div>
              <div className="font-mono text-red-loss font-semibold">
                ${selectedPairData && (selectedPairData.price * 0.95).toFixed(2)}
              </div>
            </div>
            <div className="bg-medium-gray rounded-lg p-4">
              <div className="text-xs text-text-muted mb-1">24h Change</div>
              <div className={`font-mono font-semibold ${selectedPairData && selectedPairData.change > 0 ? 'text-green-profit' : 'text-red-loss'}`}>
                {selectedPairData && selectedPairData.change > 0 ? '+' : ''}{selectedPairData?.change.toFixed(2)}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-3">
        <Card hover={false}>
          <h3 className="text-lg font-semibold mb-4">Place Order</h3>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setOrderType('buy')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                orderType === 'buy'
                  ? 'bg-green-profit text-black'
                  : 'bg-medium-gray text-text-secondary hover:bg-medium-gray/70'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderType('sell')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                orderType === 'sell'
                  ? 'bg-red-loss text-white'
                  : 'bg-medium-gray text-text-secondary hover:bg-medium-gray/70'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Price (USDT)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={selectedPairData?.price.toFixed(2)}
                className="w-full px-4 py-3 bg-medium-gray border border-text-muted/20 rounded-lg text-white font-mono focus:border-blue-primary focus:outline-none focus:ring-2 focus:ring-blue-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-medium-gray border border-text-muted/20 rounded-lg text-white font-mono focus:border-blue-primary focus:outline-none focus:ring-2 focus:ring-blue-primary/20 transition-all"
              />
            </div>

            <div className="bg-medium-gray rounded-lg p-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Total</span>
                <span className="font-mono font-semibold">
                  {amount && price ? (parseFloat(amount) * parseFloat(price)).toFixed(2) : '0.00'} USDT
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Fee (0.1%)</span>
                <span className="font-mono text-text-secondary">
                  {amount && price ? ((parseFloat(amount) * parseFloat(price)) * 0.001).toFixed(2) : '0.00'} USDT
                </span>
              </div>
            </div>

            <Button
              variant={orderType === 'buy' ? 'primary' : 'danger'}
              size="medium"
              className="w-full"
            >
              {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
            </Button>

            <div className="bg-blue-primary/10 border border-blue-primary/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-light">
                <div className="w-2 h-2 bg-green-profit rounded-full animate-pulse-soft" />
                <span>MEV Protection Active</span>
              </div>
            </div>
          </div>
        </Card>

        <Card hover={false} className="mt-4">
          <h3 className="text-sm font-semibold mb-3 text-text-secondary">Order Book</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-3 text-xs text-text-muted mb-2">
              <span>Price</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Total</span>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-3 text-xs font-mono relative">
                <div className="absolute inset-0 bg-red-loss/10 rounded" style={{ width: `${80 - i * 10}%` }} />
                <span className="text-red-loss relative z-10">
                  {selectedPairData && (selectedPairData.price * (1 - i * 0.001)).toFixed(2)}
                </span>
                <span className="text-right text-text-secondary relative z-10">{(Math.random() * 2).toFixed(4)}</span>
                <span className="text-right text-text-muted relative z-10">{(Math.random() * 10000).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-medium-gray my-2" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-3 text-xs font-mono relative">
                <div className="absolute inset-0 bg-green-profit/10 rounded" style={{ width: `${80 - i * 10}%` }} />
                <span className="text-green-profit relative z-10">
                  {selectedPairData && (selectedPairData.price * (1 + i * 0.001)).toFixed(2)}
                </span>
                <span className="text-right text-text-secondary relative z-10">{(Math.random() * 2).toFixed(4)}</span>
                <span className="text-right text-text-muted relative z-10">{(Math.random() * 10000).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
