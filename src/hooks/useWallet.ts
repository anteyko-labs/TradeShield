import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

export const useWallet = () => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { data: balance } = useBalance({
    address: address,
  });

  const connectWallet = async () => {
    try {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const getShortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    address,
    isConnected,
    connector,
    balance,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    isConnecting: isPending,
  };
};
