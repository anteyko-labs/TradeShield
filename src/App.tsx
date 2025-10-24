// React import not needed in this file
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { RealWeb3Provider, useWeb3 } from './providers/RealWeb3Provider';

function AppContent() {
  const { isConnected, connect, disconnect } = useWeb3();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
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
    <RealWeb3Provider>
      <AppContent />
    </RealWeb3Provider>
  );
}

export default App;
