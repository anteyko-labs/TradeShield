// React import not needed in this file
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Web3Provider } from './providers/Web3Provider';
import { useWallet } from './hooks/useWallet';

function AppContent() {
  const { isConnected, connectWallet, disconnectWallet } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="min-h-screen bg-black">
      {!isConnected ? (
        <LandingPage onStartTrading={handleConnect} />
      ) : (
        <Dashboard onDisconnect={handleDisconnect} />
      )}
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

export default App;
