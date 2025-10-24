import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, arbitrum, polygon, bsc, bscTestnet } from 'wagmi/chains';
import { http } from 'viem';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Configure chains with BSC Testnet
const config = getDefaultConfig({
  appName: 'TradeShield',
  projectId: 'YOUR_PROJECT_ID', // You can use a demo project ID for now
  chains: [mainnet, sepolia, arbitrum, polygon, bsc, bscTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
