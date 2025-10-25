import React, { useState } from 'react';
import { Coins, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { useRealTrading, TokenBalance, TradingPosition } from '../hooks/useRealTrading';
import { priceService } from '../services/priceService';

export const RealTokenManagement: React.FC = () => {
  const { 
    balances, 
    positions, 
    tradeHistory, 
    getTotalValue, 
    getTotalPnl, 
    getTotalPnlPercent 
  } = useRealTrading();

  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(true);

  const totalValue = getTotalValue();
  const totalPnl = getTotalPnl();
  const totalPnlPercent = getTotalPnlPercent();

  // Фильтруем токены с балансом
  const tokensWithBalance = balances.filter(token => 
    !showOnlyWithBalance || token.balance > 0
  );

  // Сортируем по стоимости
  const sortedTokens = tokensWithBalance.sort((a, b) => b.valueUSD - a.valueUSD);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatBalance = (balance: number, decimals: number) => {
    if (balance === 0) return '0';
    if (balance >= 1000) {
      return balance.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } else {
      return balance.toFixed(6);
    }
  };

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Total Portfolio</span>
          </div>
          <div className="text-3xl font-bold font-mono text-blue-primary">
            ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm mt-2 flex items-center gap-1 ${
            totalPnl >= 0 ? 'text-green-profit' : 'text-red-loss'
          }`}>
            {totalPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} ({totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Coins className="w-4 h-4" />
            <span className="text-sm">Active Positions</span>
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-info">
            {positions.length}
          </div>
          <div className="text-sm text-text-secondary mt-2">
            {positions.length > 0 ? `${positions.filter(p => p.pnl > 0).length} profitable` : 'No positions'}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Available USDT</span>
          </div>
          <div className="text-3xl font-bold font-mono text-green-profit">
            ${balances.find(b => b.symbol === 'USDT')?.balance.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-text-secondary mt-2">
            Ready to trade
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Total Trades</span>
          </div>
          <div className="text-3xl font-bold font-mono text-orange-warning">
            {tradeHistory?.length || 0}
          </div>
          <div className="text-sm text-text-secondary mt-2">
            {tradeHistory?.filter(t => t.type === 'buy').length || 0} buys, {tradeHistory?.filter(t => t.type === 'sell').length || 0} sells
          </div>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex items-center gap-4">
        <Button
          variant={showOnlyWithBalance ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setShowOnlyWithBalance(!showOnlyWithBalance)}
        >
          {showOnlyWithBalance ? 'Show All Tokens' : 'Show Only With Balance'}
        </Button>
      </div>

      {/* Список токенов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTokens.map((token) => {
          const position = positions.find(p => p.symbol === token.symbol);
          const tokenPrice = priceService.getTokenPrice(token.symbol);
          
          return (
            <Card key={token.symbol} className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-br from-blue-primary to-blue-light text-white">
                    {token.symbol}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{token.symbol}</div>
                    <div className="text-sm text-text-muted">
                      {tokenPrice ? formatPrice(tokenPrice.price) : 'Loading...'}
                    </div>
                  </div>
                </div>
                {tokenPrice && (
                  <div className={`text-sm font-semibold ${
                    tokenPrice.change24h >= 0 ? 'text-green-profit' : 'text-red-loss'
                  }`}>
                    {tokenPrice.change24h >= 0 ? '+' : ''}{tokenPrice.change24h.toFixed(2)}%
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Balance</span>
                  <span className="font-mono font-semibold">
                    {formatBalance(token.balance, token.decimals)} {token.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Value</span>
                  <span className="font-mono font-semibold text-blue-primary">
                    ${token.valueUSD.toFixed(2)}
                  </span>
                </div>
                {position && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-sm">Position</span>
                      <span className="font-mono text-sm">
                        {formatBalance(position.amount, token.decimals)} {token.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-sm">Entry Price</span>
                      <span className="font-mono text-sm">
                        ${position.entryPrice.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-sm">PnL</span>
                      <span className={`font-mono text-sm ${
                        position.pnl >= 0 ? 'text-green-profit' : 'text-red-loss'
                      }`}>
                        {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                )}
              </div>

              {token.balance > 0 && (
                <div className="border-t border-medium-gray pt-4">
                  <div className="text-xs text-text-muted mb-2">Portfolio Allocation</div>
                  <div className="w-full bg-medium-gray rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-primary to-cyan-info h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalValue > 0 ? (token.valueUSD / totalValue) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {totalValue > 0 ? ((token.valueUSD / totalValue) * 100).toFixed(1) : '0'}% of portfolio
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Активные позиции */}
      {positions.length > 0 && (
        <Card>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-profit" />
            Active Positions
          </h3>
          <div className="space-y-3">
            {positions.map((position) => (
              <div key={position.symbol} className="flex items-center justify-between p-4 bg-medium-gray rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-gradient-to-br from-blue-primary to-blue-light text-white">
                    {position.symbol}
                  </div>
                  <div>
                    <div className="font-semibold">{position.symbol}</div>
                    <div className="text-sm text-text-muted">
                      {formatBalance(position.amount, 18)} {position.symbol} @ ${position.entryPrice.toFixed(6)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-semibold ${
                    position.pnl >= 0 ? 'text-green-profit' : 'text-red-loss'
                  }`}>
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                  </div>
                  <div className={`text-sm ${
                    position.pnl >= 0 ? 'text-green-profit' : 'text-red-loss'
                  }`}>
                    {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* История торгов */}
      {tradeHistory.length > 0 && (
        <Card>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-warning" />
            Recent Trades
          </h3>
          <div className="space-y-2">
            {tradeHistory.slice(0, 10).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-medium-gray rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    trade.type === 'buy' ? 'bg-green-profit text-white' : 'bg-red-loss text-white'
                  }`}>
                    {trade.type === 'buy' ? 'B' : 'S'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {trade.type.toUpperCase()} {trade.amount.toFixed(6)} {trade.symbol}
                    </div>
                    <div className="text-xs text-text-muted">
                      {new Date(trade.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold">
                    ${trade.totalValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-muted">
                    @ ${trade.price.toFixed(6)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
