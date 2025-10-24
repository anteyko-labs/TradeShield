import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { StatusIndicator } from './StatusIndicator';

export const MEVProtection: React.FC = () => {
  const [attacksBlocked, setAttacksBlocked] = useState(1247);
  const [savingsGenerated, setSavingsGenerated] = useState(45320);
  const [efficiencyRate] = useState(99.9);
  const [protectionLevel] = useState<'basic' | 'advanced' | 'maximum'>('maximum');

  const [recentAttacks, setRecentAttacks] = useState([
    { id: 1, type: 'Front-running', time: '2 min ago', saved: '$234' },
    { id: 2, type: 'Sandwich Attack', time: '5 min ago', saved: '$892' },
    { id: 3, type: 'Back-running', time: '12 min ago', saved: '$145' },
    { id: 4, type: 'Front-running', time: '18 min ago', saved: '$567' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setAttacksBlocked(prev => prev + 1);
        setSavingsGenerated(prev => prev + Math.floor(Math.random() * 500));

        const types = ['Front-running', 'Sandwich Attack', 'Back-running', 'MEV Extraction'];
        const newAttack = {
          id: Date.now(),
          type: types[Math.floor(Math.random() * types.length)],
          time: 'Just now',
          saved: `$${Math.floor(Math.random() * 1000)}`,
        };

        setRecentAttacks(prev => [newAttack, ...prev.slice(0, 3)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-text-muted">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Attacks Blocked</span>
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-info">{attacksBlocked.toLocaleString()}</div>
          <div className="text-sm text-green-profit mt-2">+127 today</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-text-muted">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Savings Generated</span>
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-green-profit">${savingsGenerated.toLocaleString()}</div>
          <div className="text-sm text-green-profit mt-2">+$4,230 today</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-text-muted">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Efficiency Rate</span>
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-blue-primary">{efficiencyRate}%</div>
          <div className="text-sm text-text-secondary mt-2">Optimal performance</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-text-muted">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Protection Level</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-profit capitalize">{protectionLevel}</div>
          <StatusIndicator status="active" pulse />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover={false} className="md:col-span-2">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-primary" />
            Protection Settings
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-medium-gray rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-primary" />
                </div>
                <div>
                  <div className="font-semibold">Front-running Protection</div>
                  <div className="text-sm text-text-muted">Prevents transactions from being front-run</div>
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-profit transition-colors">
                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-medium-gray rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-profit/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-green-profit" />
                </div>
                <div>
                  <div className="font-semibold">Sandwich Attack Protection</div>
                  <div className="text-sm text-text-muted">Blocks sandwich attacks on your trades</div>
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-profit transition-colors">
                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-medium-gray rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-info/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-info" />
                </div>
                <div>
                  <div className="font-semibold">Back-running Protection</div>
                  <div className="text-sm text-text-muted">Prevents back-running MEV extraction</div>
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-profit transition-colors">
                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-medium-gray rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-warning/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-warning" />
                </div>
                <div>
                  <div className="font-semibold">Slippage Protection</div>
                  <div className="text-sm text-text-muted">Automatically adjusts for optimal slippage</div>
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-profit transition-colors">
                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-primary/10 to-transparent border border-blue-primary/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-primary mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-blue-light mb-1">Protection Level: Maximum</div>
                <div className="text-sm text-text-secondary">
                  All protection mechanisms are active. Your transactions are fully protected from MEV attacks.
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-info" />
            Recent Activity
          </h3>

          <div className="space-y-3">
            {recentAttacks.map((attack) => (
              <div
                key={attack.id}
                className="p-3 bg-medium-gray rounded-lg border border-green-profit/20 animate-slide-in-right"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-profit rounded-full animate-pulse-soft" />
                    <span className="text-sm font-semibold">{attack.type}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-profit" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{attack.time}</span>
                  <span className="text-green-profit font-semibold">Saved {attack.saved}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-green-profit/10 border border-green-profit/30 rounded-lg">
            <div className="text-xs text-text-muted mb-1">Total Saved Today</div>
            <div className="text-2xl font-bold font-mono text-green-profit">$4,230</div>
          </div>
        </Card>
      </div>

      <Card hover={false}>
        <h3 className="text-xl font-semibold mb-6">Protection Timeline</h3>
        <div className="relative">
          <div className="h-48 bg-medium-gray rounded-lg p-4 flex items-end justify-around">
            {[...Array(24)].map((_, i) => {
              const height = Math.random() * 80 + 20;
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-green-profit to-cyan-info rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${height}%` }}
                  />
                  {i % 3 === 0 && (
                    <span className="text-xs text-text-muted">{i}h</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-profit rounded" />
              <span className="text-text-secondary">Attacks Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-info rounded" />
              <span className="text-text-secondary">Protection Active</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
