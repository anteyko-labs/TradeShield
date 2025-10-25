import React from 'react';

export const SimpleTest: React.FC = () => {
  return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">TradeShield Exchange</h1>
        <p className="text-gray-400 mb-8">Real Trading System with Bots</p>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Bots:</span>
              <span className="text-green-400">40 Active</span>
            </div>
            <div className="flex justify-between">
              <span>Trading:</span>
              <span className="text-green-400">Running</span>
            </div>
            <div className="flex justify-between">
              <span>Orders:</span>
              <span className="text-blue-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
