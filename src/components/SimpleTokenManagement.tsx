import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { useSimpleBalance } from '../hooks/useSimpleBalance';

export const SimpleTokenManagement: React.FC = () => {
  const { balances, totalValue, loading } = useSimpleBalance();
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(true);

  const filteredBalances = showOnlyWithBalance 
    ? balances.filter(balance => balance.balance > 0)
    : balances;

  const formatBalance = (balance: number, decimals: number = 6) => {
    return balance.toFixed(decimals);
  };

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">💰 Portfolio</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={showOnlyWithBalance}
              onChange={(e) => setShowOnlyWithBalance(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <span>Show only with balance</span>
          </label>
        </div>
      </div>

      {/* Total Value Card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Total Portfolio Value</h3>
                <p className="text-sm text-gray-400">All your assets combined</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {loading ? 'Loading...' : formatValue(totalValue)}
              </div>
              <div className="text-sm text-gray-400">
                {filteredBalances.length} assets
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Token Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBalances.map((balance, index) => (
          <Card key={index}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Coins className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{balance.symbol}</h4>
                    <p className="text-sm text-gray-400">{balance.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    {formatBalance(balance.balance)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatValue(balance.value)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white">${balance.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">24h Change:</span>
                  <span className={`flex items-center space-x-1 ${
                    balance.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {balance.change24h >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{balance.change24h >= 0 ? '+' : ''}{balance.change24h.toFixed(2)}%</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBalances.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Assets Found</h3>
            <p className="text-gray-500">
              {showOnlyWithBalance 
                ? 'You don\'t have any assets with balance.' 
                : 'No assets available.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
