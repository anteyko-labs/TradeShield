import React from 'react';
import { Clock, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';

interface TradeLog {
  id: string;
  timestamp: number;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: number;
  price: number;
  totalValue: number;
  fee: number;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface TradingLogsProps {
  logs: TradeLog[];
}

export const TradingLogs: React.FC<TradingLogsProps> = ({ logs }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(6);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Trading Logs</h3>
          <div className="text-sm text-gray-400">
            {logs.length} transactions
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto">
        {logs.length > 0 ? (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div 
                key={log.id} 
                className="border-b border-gray-700 px-4 py-3 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{formatTime(log.timestamp)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(log.status)}`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    #{index + 1}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <ArrowDownLeft className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-400">From:</span>
                    </div>
                    <div className="text-sm font-mono text-gray-300">
                      {formatAddress(log.fromAddress)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">To:</span>
                    </div>
                    <div className="text-sm font-mono text-gray-300">
                      {formatAddress(log.toAddress)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Token & Amount</div>
                    <div className="text-sm font-semibold">
                      {formatAmount(log.amount)} {log.token}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Price</div>
                    <div className="text-sm font-semibold">
                      ${formatPrice(log.price)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Total Value</div>
                    <div className="text-sm font-semibold">
                      ${formatValue(log.totalValue)}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-gray-400">Fee:</span>
                      <span className="text-xs text-blue-400">
                        ${formatValue(log.fee)} (0.2%)
                      </span>
                    </div>
                    
                    {log.txHash && (
                      <div className="text-xs text-gray-500 font-mono">
                        {log.txHash.slice(0, 10)}...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-500 text-lg mb-2">No trades yet</div>
              <div className="text-gray-600 text-sm">
                Trading logs will appear here as bots execute trades
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-400">Total Trades</div>
            <div className="text-sm font-semibold">{logs.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Total Fees</div>
            <div className="text-sm font-semibold">
              ${logs.reduce((sum, log) => sum + log.fee, 0).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Volume</div>
            <div className="text-sm font-semibold">
              ${logs.reduce((sum, log) => sum + log.totalValue, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
