import React, { useState } from 'react';
import { Calculator, TrendingUp, BarChart3, Target, AlertTriangle, Zap } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface TradingToolsProps {
  className?: string;
}

export const TradingTools: React.FC<TradingToolsProps> = ({ className = '' }) => {
  const [activeTool, setActiveTool] = useState<string>('calculator');
  const [positionSize, setPositionSize] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [riskPercentage, setRiskPercentage] = useState('2');

  const calculatePositionSize = () => {
    const accountBalance = 10000; // Mock account balance
    const riskAmount = (accountBalance * parseFloat(riskPercentage)) / 100;
    const riskPerUnit = Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss));
    const positionSize = riskAmount / riskPerUnit;
    return positionSize.toFixed(2);
  };

  const calculateRiskReward = () => {
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const profit = parseFloat(takeProfit);
    
    if (!entry || !stop || !profit) return { ratio: 0, risk: 0, reward: 0 };
    
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(profit - entry);
    const ratio = reward / risk;
    
    return { ratio: ratio.toFixed(2), risk: risk.toFixed(2), reward: reward.toFixed(2) };
  };

  const tools = [
    { id: 'calculator', name: 'Position Calculator', icon: Calculator, color: 'text-blue-primary' },
    { id: 'risk', name: 'Risk Management', icon: AlertTriangle, color: 'text-red-loss' },
    { id: 'fibonacci', name: 'Fibonacci Tools', icon: TrendingUp, color: 'text-green-profit' },
    { id: 'indicators', name: 'Technical Indicators', icon: BarChart3, color: 'text-yellow-500' },
    { id: 'targets', name: 'Price Targets', icon: Target, color: 'text-purple-500' },
    { id: 'alerts', name: 'Price Alerts', icon: Zap, color: 'text-orange-500' }
  ];

  const { ratio, risk, reward } = calculateRiskReward();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tool Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
              activeTool === tool.id
                ? 'bg-blue-primary/20 border border-blue-primary'
                : 'bg-medium-gray hover:bg-medium-gray/80'
            }`}
          >
            <tool.icon className={`w-5 h-5 ${tool.color}`} />
            <span className="text-xs text-center">{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Position Calculator */}
      {activeTool === 'calculator' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-primary" />
              Position Size Calculator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-muted mb-2">Account Balance</label>
                  <input
                    type="text"
                    value="$10,000"
                    disabled
                    className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Risk Percentage (%)</label>
                  <input
                    type="number"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Entry Price</label>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Stop Loss</label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-medium-gray rounded-lg p-4">
                  <div className="text-sm text-text-muted mb-2">Position Size</div>
                  <div className="text-2xl font-bold text-blue-primary">
                    {positionSize && entryPrice && stopLoss ? calculatePositionSize() : '0.00'} units
                  </div>
                </div>
                <div className="bg-medium-gray rounded-lg p-4">
                  <div className="text-sm text-text-muted mb-2">Risk Amount</div>
                  <div className="text-xl font-semibold text-red-loss">
                    ${((10000 * parseFloat(riskPercentage)) / 100).toFixed(2)}
                  </div>
                </div>
                <div className="bg-medium-gray rounded-lg p-4">
                  <div className="text-sm text-text-muted mb-2">Risk per Unit</div>
                  <div className="text-lg font-semibold text-white">
                    ${entryPrice && stopLoss ? Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss)).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Risk Management */}
      {activeTool === 'risk' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-loss" />
              Risk Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-muted mb-2">Take Profit</label>
                  <input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-lg text-white"
                  />
                </div>
                <div className="bg-medium-gray rounded-lg p-4">
                  <div className="text-sm text-text-muted mb-2">Risk/Reward Ratio</div>
                  <div className={`text-2xl font-bold ${parseFloat(ratio) >= 2 ? 'text-green-profit' : parseFloat(ratio) >= 1 ? 'text-yellow-500' : 'text-red-loss'}`}>
                    1:{ratio}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-medium-gray rounded-lg p-4">
                  <div className="text-sm text-text-muted mb-2">Risk Amount</div>
                  <div className="text-xl font-semibold text-red-loss">${risk}</div>
                </div>
                <div className="bg-medium-gray rounded-lg p-4">
                  <div className="text-sm text-text-muted mb-2">Reward Amount</div>
                  <div className="text-xl font-semibold text-green-profit">${reward}</div>
                </div>
                <div className="bg-medium-gray rounded-lg p-4">
                  <div className="text-sm text-text-muted mb-2">Recommendation</div>
                  <div className={`text-sm font-semibold ${
                    parseFloat(ratio) >= 2 ? 'text-green-profit' : 
                    parseFloat(ratio) >= 1 ? 'text-yellow-500' : 'text-red-loss'
                  }`}>
                    {parseFloat(ratio) >= 2 ? '✅ Good Risk/Reward' : 
                     parseFloat(ratio) >= 1 ? '⚠️ Acceptable' : '❌ Poor Risk/Reward'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Other Tools Placeholder */}
      {activeTool !== 'calculator' && activeTool !== 'risk' && (
        <Card>
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold mb-2">
              {tools.find(t => t.id === activeTool)?.name}
            </h3>
            <p className="text-text-muted">
              Advanced {tools.find(t => t.id === activeTool)?.name.toLowerCase()} tools coming soon...
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
