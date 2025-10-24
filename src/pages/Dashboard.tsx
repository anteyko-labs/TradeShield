import React, { useState } from 'react';
import { Shield, TrendingUp, Wallet, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/Button';
import { StatusIndicator } from '../components/StatusIndicator';
import { TradingInterface } from '../components/TradingInterface';
import { MEVProtection } from '../components/MEVProtection';
import { TokenManagement } from '../components/TokenManagement';
import { useWallet } from '../hooks/useWallet';

type TabType = 'trading' | 'mev' | 'tokens' | 'analytics';

interface DashboardProps {
  onDisconnect: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onDisconnect }) => {
  const [activeTab, setActiveTab] = useState<TabType>('trading');
  const { address, balance, getShortAddress } = useWallet();
  
  const walletAddress = address ? getShortAddress(address) : '0x742d...4f2a';
  const balanceFormatted = balance ? parseFloat(balance.formatted).toLocaleString() : '12,458.32';

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-medium-gray bg-dark-gray">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-primary" />
                <span className="text-2xl font-bold">TradeShield</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'trading' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setActiveTab('trading')}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Trading
                </Button>
                <Button
                  variant={activeTab === 'mev' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setActiveTab('mev')}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  MEV Protection
                </Button>
                <Button
                  variant={activeTab === 'tokens' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setActiveTab('tokens')}
                >
                  <Wallet className="w-4 h-4 inline mr-2" />
                  Tokens
                </Button>
                <Button
                  variant={activeTab === 'analytics' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Analytics
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StatusIndicator status="active" label="MEV Protected" pulse />

              <div className="flex items-center gap-3 px-4 py-2 bg-medium-gray rounded-lg border border-text-muted/20">
                <Wallet className="w-5 h-5 text-blue-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Balance</span>
                  <span className="text-sm font-mono font-semibold">${balanceFormatted}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-medium-gray rounded-lg border border-green-profit/20">
                <div className="w-2 h-2 bg-green-profit rounded-full animate-pulse-soft" />
                <span className="text-sm font-mono">{walletAddress}</span>
              </div>

              <Button variant="secondary" size="small">
                <Settings className="w-4 h-4" />
              </Button>

              <Button variant="secondary" size="small" onClick={onDisconnect}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="animate-fade-in">
          {activeTab === 'trading' && <TradingInterface />}
          {activeTab === 'mev' && <MEVProtection />}
          {activeTab === 'tokens' && <TokenManagement />}
          {activeTab === 'analytics' && (
            <div className="text-center py-20 text-text-muted">
              Analytics dashboard coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
