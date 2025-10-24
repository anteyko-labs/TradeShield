import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
}

interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  size: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  timestamp: string;
  orderId: string;
}

interface PortfolioProps {
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  totalBalance: number;
  availableBalance: number;
  totalPnl: number;
  totalPnlPercent: number;
  onCancelOrder: (orderId: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  positions,
  orders,
  trades,
  totalBalance,
  availableBalance,
  totalPnl,
  totalPnlPercent,
  onCancelOrder
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPnl = (pnl: number) => {
    return pnl >= 0 ? `+$${formatPrice(pnl)}` : `-$${formatPrice(Math.abs(pnl))}`;
  };

  const formatPercent = (percent: number) => {
    return percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Wallet className="w-5 h-5 mr-2" />
          Portfolio Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">${formatPrice(totalBalance)}</div>
            <div className="text-sm text-gray-400">Total Balance</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">${formatPrice(availableBalance)}</div>
            <div className="text-sm text-gray-400">Available</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPnl(totalPnl)}
            </div>
            <div className="text-sm text-gray-400">Total P&L</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${totalPnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(totalPnlPercent)}
            </div>
            <div className="text-sm text-gray-400">P&L %</div>
          </div>
        </div>
      </div>

      {/* Positions */}
      {positions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Open Positions ({positions.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-right py-2">Side</th>
                  <th className="text-right py-2">Size</th>
                  <th className="text-right py-2">Entry Price</th>
                  <th className="text-right py-2">Current Price</th>
                  <th className="text-right py-2">P&L</th>
                  <th className="text-right py-2">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 font-mono">{position.symbol}</td>
                    <td className="text-right py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        position.side === 'long' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {position.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right py-2 font-mono">{position.size.toFixed(4)}</td>
                    <td className="text-right py-2 font-mono">${formatPrice(position.entryPrice)}</td>
                    <td className="text-right py-2 font-mono">${formatPrice(position.currentPrice)}</td>
                    <td className={`text-right py-2 font-mono ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPnl(position.pnl)}
                    </td>
                    <td className={`text-right py-2 font-mono ${position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(position.pnlPercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Open Orders */}
      {orders.filter(o => o.status === 'pending').length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Open Orders ({orders.filter(o => o.status === 'pending').length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-right py-2">Side</th>
                  <th className="text-right py-2">Type</th>
                  <th className="text-right py-2">Size</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Time</th>
                  <th className="text-right py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => o.status === 'pending').map((order) => (
                  <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 font-mono">{order.symbol}</td>
                    <td className="text-right py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.side === 'buy' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right py-2">
                      <span className="px-2 py-1 rounded text-xs bg-gray-600 text-white">
                        {order.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right py-2 font-mono">{order.size.toFixed(4)}</td>
                    <td className="text-right py-2 font-mono">
                      {order.price ? `$${formatPrice(order.price)}` : 'Market'}
                    </td>
                    <td className="text-right py-2 text-gray-400">{formatDate(order.timestamp)}</td>
                    <td className="text-right py-2">
                      <button
                        onClick={() => onCancelOrder(order.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Trades */}
      {trades.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Recent Trades ({trades.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-right py-2">Side</th>
                  <th className="text-right py-2">Size</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 10).map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 font-mono">{trade.symbol}</td>
                    <td className="text-right py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.side === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right py-2 font-mono">{trade.size.toFixed(4)}</td>
                    <td className="text-right py-2 font-mono">${formatPrice(trade.price)}</td>
                    <td className="text-right py-2 text-gray-400">{formatDate(trade.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
