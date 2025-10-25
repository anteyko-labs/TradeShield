import React, { useState, useEffect } from 'react';
import { Bot, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PersistentBot {
  id: string;
  name: string;
  address: string;
  balances: {
    USDT: number;
    BTC: number;
    ETH: number;
  };
  isActive: boolean;
  lastTrade: number;
  totalTrades: number;
  totalVolume: number;
  totalFees: number;
}

interface PersistentBotBalancesProps {
  bots: PersistentBot[];
}

export const PersistentBotBalances: React.FC<PersistentBotBalancesProps> = ({ bots }) => {
  const [stats, setStats] = useState({
    totalBots: 0,
    activeBots: 0,
    totalTrades: 0,
    totalVolume: 0,
    totalFees: 0
  });

  useEffect(() => {
    const totalBots = bots.length;
    const activeBots = bots.filter(bot => bot.isActive).length;
    const totalTrades = bots.reduce((sum, bot) => sum + bot.totalTrades, 0);
    const totalVolume = bots.reduce((sum, bot) => sum + bot.totalVolume, 0);
    const totalFees = bots.reduce((sum, bot) => sum + bot.totalFees, 0);

    setStats({
      totalBots,
      activeBots,
      totalTrades,
      totalVolume,
      totalFees
    });
  }, [bots]);

  const formatBalance = (amount: number, decimals: number = 2) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const getTotalValue = (bot: PersistentBot) => {
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

  const getLastTradeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}м ${seconds}с назад`;
    }
    return `${seconds}с назад`;
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Всего ботов</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.totalBots}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Активных</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.activeBots}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Сделок</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">{stats.totalTrades}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Объем</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">${formatBalance(stats.totalVolume)}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-400">Комиссии</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">${formatBalance(stats.totalFees)}</div>
        </div>
      </div>

      {/* Список ботов */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">🤖 Постоянные торговые боты</h2>
        <p className="text-gray-400 mb-6">
          Автоматически торгуют 24/7 с реальными кошельками на Sepolia
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.slice(0, 12).map((bot, index) => (
            <div key={bot.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-blue-400">{bot.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${bot.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                </div>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Адрес:</span>
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
                
                <div className="border-t border-gray-600 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Сделок:</span>
                    <span className="font-semibold text-white">{bot.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Объем:</span>
                    <span className="font-semibold text-white">${formatBalance(bot.totalVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Последняя:</span>
                    <span className="text-xs text-gray-300">
                      {getLastTradeTime(bot.lastTrade)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Стоимость:</span>
                    <span className="font-semibold text-white">
                      ${formatBalance(getTotalValue(bot))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {bots.length > 12 && (
          <div className="mt-4 text-center">
            <span className="text-gray-400">
              Показано 12 из {bots.length} ботов
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
