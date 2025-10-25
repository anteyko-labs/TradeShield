import React, { useState } from 'react';
import { Shield, Lock, Eye, Zap, AlertTriangle } from 'lucide-react';

interface MEVProtectionPanelProps {
  onSettingsChange: (settings: {
    privateMempool?: boolean;
    commitReveal?: boolean;
    antiSandwich?: boolean;
    slippageProtection?: boolean;
  }) => void;
}

export const MEVProtectionPanel: React.FC<MEVProtectionPanelProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    privateMempool: true,
    commitReveal: true,
    antiSandwich: true,
    slippageProtection: true
  });

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const protectionFeatures = [
    {
      key: 'privateMempool' as const,
      title: 'Private Mempool',
      description: 'Route transactions through private mempool to avoid MEV extraction',
      icon: Lock,
      color: 'text-blue-400'
    },
    {
      key: 'commitReveal' as const,
      title: 'Commit-Reveal Scheme',
      description: 'Use commit-reveal pattern to hide transaction intent',
      icon: Eye,
      color: 'text-green-400'
    },
    {
      key: 'antiSandwich' as const,
      title: 'Anti-Sandwich Protection',
      description: 'Detect and prevent sandwich attacks on your transactions',
      icon: Shield,
      color: 'text-purple-400'
    },
    {
      key: 'slippageProtection' as const,
      title: 'Slippage Protection',
      description: 'Set maximum slippage tolerance to prevent excessive price impact',
      icon: Zap,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">MEV Protection</h2>
        <div className="ml-auto">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Active</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {protectionFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.key} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                  <div>
                    <h3 className="text-white font-semibold">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[feature.key]}
                    onChange={(e) => handleSettingChange(feature.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-semibold mb-1">How MEV Protection Works</h4>
            <p className="text-gray-300 text-sm">
              Our advanced MEV protection system uses multiple layers of defense to protect your trades 
              from front-running, sandwich attacks, and other MEV extraction techniques. All protection 
              features are enabled by default and work automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-gray-400 text-sm">Protected Trades</div>
          <div className="text-white font-bold text-lg">1,247</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-gray-400 text-sm">MEV Saved</div>
          <div className="text-green-400 font-bold text-lg">$2,341</div>
        </div>
      </div>
    </div>
  );
};
