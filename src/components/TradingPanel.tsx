import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { Button } from './Button';
import { useWeb3 } from '../providers/RealWeb3Provider';
import { tradingService, TradeOrder } from '../services/tradingService';

interface TradingPanelProps {
  pair: string;
  currentPrice: number;
  className?: string;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({ 
  pair, 
  currentPrice, 
  className = '' 
}) => {
  const { address, balance } = useWeb3();
  
  // Trading state
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastOrder, setLastOrder] = useState<TradeOrder | null>(null);

  // Calculate order value
  const orderValue = amount && currentPrice ? 
    parseFloat(amount) * (orderType === 'market' ? currentPrice : parseFloat(price || '0')) : 0;

  // Calculate slippage
  const slippage = tradingService.calculateSlippage(
    parseFloat(amount || '0'), 
    tradingService.getOrderBook(pair, currentPrice)
  );

  // Handle percentage slider
  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    if (balance) {
      const balanceNum = parseFloat(balance);
      const maxAmount = balanceNum * (value / 100);
      setAmount(maxAmount.toFixed(6));
    }
  };

  // Execute trade
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
      alert('Please enter a valid price for limit orders');
      return;
    }

    // Validate order
    const validation = tradingService.validateOrder({
      amount: parseFloat(amount),
      price: orderType === 'limit' ? parseFloat(price) : undefined,
      side,
      type: orderType
    });

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsExecuting(true);

    try {
      const order = await tradingService.executeOrder({
        pair,
        side,
        type: orderType,
        amount: parseFloat(amount),
        price: orderType === 'limit' ? parseFloat(price) : undefined
      });

      setLastOrder(order);
      
      // Reset form
      setAmount('');
      setPrice('');
      setPercentage(0);
      
      // Show success message
      alert(`Order executed successfully! Order ID: ${order.id}`);
      
    } catch (error) {
      console.error('Trade execution failed:', error);
      alert(`Trade execution failed: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Quick amount buttons
  const quickAmounts = [25, 50, 75, 100];

  return (
    <div className={`bg-gray-800 ${className}`}>
      <div className="p-4 space-y-4">
        {/* Order Type Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
              orderType === 'market' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
              orderType === 'limit' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Limit
          </button>
        </div>

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSide('buy')}
            className={`py-3 rounded font-semibold flex items-center justify-center space-x-2 ${
              side === 'buy' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Buy</span>
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`py-3 rounded font-semibold flex items-center justify-center space-x-2 ${
              side === 'sell' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Sell</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Amount</label>
          <div className="flex">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-l px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <select className="bg-gray-700 border border-gray-600 rounded-r px-2 text-white">
              <option>BTC</option>
              <option>USDT</option>
            </select>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex space-x-1 mt-2">
            {quickAmounts.map(pct => (
              <button
                key={pct}
                onClick={() => handlePercentageChange(pct)}
                className={`px-2 py-1 text-xs rounded ${
                  percentage === pct 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Price Input (for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Percentage Slider */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Percentage: {percentage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
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
        <div className="bg-gray-700 rounded p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Order Value:</span>
            <span className="text-white">
              ${orderValue.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Slippage:</span>
            <span className="text-white">
              Est: {slippage.estimated.toFixed(2)}% / Max: {slippage.maximum.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Fee:</span>
            <span className="text-white">0.1%</span>
          </div>
        </div>

        {/* Execute Trade Button */}
        <button
          onClick={executeTrade}
          disabled={isExecuting || !amount}
          className={`w-full py-3 rounded font-semibold flex items-center justify-center space-x-2 ${
            side === 'buy' 
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600' 
              : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600'
          } ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isExecuting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Executing...</span>
            </>
          ) : (
            <span>{side === 'buy' ? 'Buy' : 'Sell'} {pair}</span>
          )}
        </button>

        {/* Connect Wallet Button */}
        {!address && (
          <Button 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700"
            onClick={() => {/* Connect wallet logic */}}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        )}

        {/* Last Order Info */}
        {lastOrder && (
          <div className="bg-gray-700 rounded p-3">
            <div className="text-sm text-gray-400 mb-1">Last Order</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="text-white">{lastOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`${
                  lastOrder.status === 'filled' ? 'text-green-400' : 
                  lastOrder.status === 'failed' ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {lastOrder.status}
                </span>
              </div>
              {lastOrder.txHash && (
                <div className="flex justify-between">
                  <span>TX:</span>
                  <span className="text-white font-mono text-xs">
                    {lastOrder.txHash.slice(0, 8)}...{lastOrder.txHash.slice(-8)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Balance Info */}
        {address && (
          <div className="text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Balance:</span>
              <span className="text-white">
                {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0.0000 ETH'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
