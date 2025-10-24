import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPublicClient, createWalletClient, custom, http, formatEther, parseEther } from 'viem';
import { sepolia } from 'viem/chains';

interface Web3ContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  getShortAddress: (addr: string) => string;
  publicClient: any;
  walletClient: any;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface RealWeb3ProviderProps {
  children: React.ReactNode;
}

export const RealWeb3Provider: React.FC<RealWeb3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Create clients with fallback RPC
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://sepolia.gateway.tenderly.co'), // Free public RPC
  });

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum!),
  });

  const connect = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const userAddress = accounts[0];
        setAddress(userAddress);
        setIsConnected(true);

        // Get chain ID
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });
        setChainId(parseInt(chainId, 16));

        // Get balance
        await fetchBalance(userAddress);

        console.log('Wallet connected:', userAddress);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const fetchBalance = async (userAddress: string) => {
    try {
      const balance = await publicClient.getBalance({
        address: userAddress as `0x${string}`,
      });
      const formattedBalance = formatEther(balance);
      setBalance(parseFloat(formattedBalance).toFixed(4));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('0.0000');
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance(null);
    setChainId(null);
    setIsConnected(false);
    console.log('Wallet disconnected');
  };

  const getShortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            const userAddress = accounts[0];
            setAddress(userAddress);
            setIsConnected(true);

            // Get chain ID
            const chainId = await window.ethereum.request({
              method: 'eth_chainId',
            });
            setChainId(parseInt(chainId, 16));

            // Get balance
            await fetchBalance(userAddress);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
          fetchBalance(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        if (address) {
          fetchBalance(address);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address]);

  const value: Web3ContextType = {
    isConnected,
    address,
    balance,
    chainId,
    connect,
    disconnect,
    getShortAddress,
    publicClient,
    walletClient,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}
