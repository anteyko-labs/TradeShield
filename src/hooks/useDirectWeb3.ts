import { useState, useEffect } from 'react';

export const useDirectWeb3 = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            
            // Создаем provider и signer для ethers.js
            const { ethers } = await import('ethers');
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            setProvider(provider);
            setSigner(signer);
            
            console.log('✅ Wallet connected:', accounts[0]);
            console.log('✅ Provider created:', !!provider);
            console.log('✅ Signer created:', !!signer);
          }
        } catch (error) {
          console.error('❌ Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Слушаем изменения аккаунтов
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
          setProvider(null);
          setSigner(null);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert('MetaMask not installed!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // Создаем provider и signer для ethers.js
        const { ethers } = await import('ethers');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        setProvider(provider);
        setSigner(signer);
        
        console.log('✅ Wallet connected:', accounts[0]);
        console.log('✅ Provider created:', !!provider);
        console.log('✅ Signer created:', !!signer);
      }
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
    }
  };

  return {
    address,
    provider,
    signer,
    isConnected,
    connect
  };
};
