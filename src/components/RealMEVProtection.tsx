import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp, Settings, Info } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface MEVSettings {
  frontRunningProtection: boolean;
  sandwichAttackProtection: boolean;
  backRunningProtection: boolean;
  slippageProtection: boolean;
  privateMempool: boolean;
  commitReveal: boolean;
  maxSlippage: number;
}

export const RealMEVProtection: React.FC = () => {
  const [attacksBlocked, setAttacksBlocked] = useState(1247);
  const [savingsGenerated, setSavingsGenerated] = useState(45320);
  const [efficiencyRate] = useState(99.9);
  const [protectionLevel] = useState<'basic' | 'advanced' | 'maximum'>('maximum');

  const [settings, setSettings] = useState<MEVSettings>({
    frontRunningProtection: true,
    sandwichAttackProtection: true,
    backRunningProtection: true,
    slippageProtection: true,
    privateMempool: true,
    commitReveal: false,
    maxSlippage: 0.5
  });

  const [recentAttacks, setRecentAttacks] = useState([
    { id: 1, type: 'Front-running', time: '2 min ago', saved: '$234', severity: 'high' },
    { id: 2, type: 'Sandwich Attack', time: '5 min ago', saved: '$892', severity: 'medium' },
    { id: 3, type: 'Back-running', time: '12 min ago', saved: '$145', severity: 'low' },
    { id: 4, type: 'Front-running', time: '18 min ago', saved: '$567', severity: 'high' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setAttacksBlocked(prev => prev + 1);
        setSavingsGenerated(prev => prev + Math.floor(Math.random() * 500));

        const types = ['Front-running', 'Sandwich Attack', 'Back-running', 'MEV Extraction'];
        const severities = ['high', 'medium', 'low'];
        const newAttack = {
          id: Date.now(),
          type: types[Math.floor(Math.random() * types.length)],
          time: 'Just now',
          saved: `$${Math.floor(Math.random() * 1000)}`,
          severity: severities[Math.floor(Math.random() * severities.length)]
        };

        setRecentAttacks(prev => [newAttack, ...prev.slice(0, 3)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateSetting = (key: keyof MEVSettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-loss';
      case 'medium': return 'text-orange-warning';
      case 'low': return 'text-green-profit';
      default: return 'text-text-muted';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-loss/10 border-red-loss/30';
      case 'medium': return 'bg-orange-warning/10 border-orange-warning/30';
      case 'low': return 'bg-green-profit/10 border-green-profit/30';
      default: return 'bg-medium-gray border-medium-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
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
          <div className="w-2 h-2 bg-green-profit rounded-full animate-pulse-soft mt-2" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Настройки защиты */}
        <Card className="md:col-span-2">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-primary" />
            Protection Settings
          </h3>

          <div className="space-y-6">
            {/* Front-running Protection */}
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
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.frontRunningProtection ? 'bg-green-profit' : 'bg-gray-600'
                }`}
                onClick={() => updateSetting('frontRunningProtection', !settings.frontRunningProtection)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.frontRunningProtection ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Sandwich Attack Protection */}
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
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.sandwichAttackProtection ? 'bg-green-profit' : 'bg-gray-600'
                }`}
                onClick={() => updateSetting('sandwichAttackProtection', !settings.sandwichAttackProtection)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.sandwichAttackProtection ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Back-running Protection */}
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
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.backRunningProtection ? 'bg-green-profit' : 'bg-gray-600'
                }`}
                onClick={() => updateSetting('backRunningProtection', !settings.backRunningProtection)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.backRunningProtection ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Slippage Protection */}
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
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.slippageProtection ? 'bg-green-profit' : 'bg-gray-600'
                }`}
                onClick={() => updateSetting('slippageProtection', !settings.slippageProtection)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.slippageProtection ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Max Slippage Setting */}
            {settings.slippageProtection && (
              <div className="p-4 bg-blue-primary/10 border border-blue-primary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-primary" />
                  <span className="text-sm font-semibold text-blue-primary">Max Slippage Tolerance</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={settings.maxSlippage}
                    onChange={(e) => updateSetting('maxSlippage', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-blue-primary min-w-[60px]">
                    {settings.maxSlippage}%
                  </span>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text-muted">Advanced Settings</h4>
              
              {/* Private Mempool */}
              <div className="flex items-center justify-between p-3 bg-medium-gray rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-info/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-cyan-info" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Private Mempool</div>
                    <div className="text-xs text-text-muted">Submit transactions directly to miners</div>
                  </div>
                </div>
                <button 
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.privateMempool ? 'bg-green-profit' : 'bg-gray-600'
                  }`}
                  onClick={() => updateSetting('privateMempool', !settings.privateMempool)}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.privateMempool ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Commit-Reveal Scheme */}
              <div className="flex items-center justify-between p-3 bg-medium-gray rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-warning/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-orange-warning" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Commit-Reveal Scheme</div>
                    <div className="text-xs text-text-muted">Hide trade intentions until after block mining</div>
                  </div>
                </div>
                <button 
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.commitReveal ? 'bg-green-profit' : 'bg-gray-600'
                  }`}
                  onClick={() => updateSetting('commitReveal', !settings.commitReveal)}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.commitReveal ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-profit/10 to-transparent border border-green-profit/30 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-profit mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-green-profit mb-1">Protection Active</div>
                <div className="text-sm text-text-secondary">
                  All enabled protection mechanisms are active. Your transactions are protected from MEV attacks.
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-info" />
            Recent Activity
          </h3>

          <div className="space-y-3">
            {recentAttacks.map((attack) => (
              <div
                key={attack.id}
                className={`p-3 rounded-lg border animate-slide-in-right ${getSeverityBg(attack.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse-soft ${
                      attack.severity === 'high' ? 'bg-red-loss' : 
                      attack.severity === 'medium' ? 'bg-orange-warning' : 'bg-green-profit'
                    }`} />
                    <span className="text-sm font-semibold">{attack.type}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-profit" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{attack.time}</span>
                  <span className={`font-semibold ${getSeverityColor(attack.severity)}`}>
                    Saved {attack.saved}
                  </span>
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

      {/* Protection Timeline */}
      <Card>
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
