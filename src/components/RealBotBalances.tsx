import React from 'react';

interface BotBalance {
  name: string;
  address: string;
  balances: {
    USDT: number;
    BTC: number;
    ETH: number;
  };
}

interface RealBotBalancesProps {
  balances: BotBalance[];
}

export const RealBotBalances: React.FC<RealBotBalancesProps> = ({ balances }) => {
  const formatBalance = (amount: number, decimals: number = 2) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const getTotalValue = (bot: BotBalance) => {
    // Примерные цены для расчета общей стоимости
    const prices = {
      USDT: 1,
      BTC: 65000,
      ETH: 3000
    };
    
    return (
      bot.balances.USDT * prices.USDT +
      bot.balances.BTC * prices.BTC +
      bot.balances.ETH * prices.ETH
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">🤖 Trading Bots Balances</h2>
        <p className="text-gray-400 mb-6">
          Real bots with Sepolia addresses trading 24/7
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.slice(0, 12).map((bot, index) => (
            <div key={bot.address} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-400">{bot.name}</h3>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="font-mono text-xs text-blue-300">
                    {bot.address.slice(0, 6)}...{bot.address.slice(-4)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">USDT:</span>
                  <span className="text-green-400">
                    {formatBalance(bot.balances.USDT, 2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">BTC:</span>
                  <span className="text-orange-400">
                    {formatBalance(bot.balances.BTC, 4)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">ETH:</span>
                  <span className="text-blue-400">
                    {formatBalance(bot.balances.ETH, 3)}
                  </span>
                </div>
                
                <div className="border-t border-gray-600 pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Value:</span>
                    <span className="font-semibold text-white">
                      ${formatBalance(getTotalValue(bot))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {balances.length > 12 && (
          <div className="mt-4 text-center">
            <span className="text-gray-400">
              Showing 12 of {balances.length} bots
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
