import React from 'react';
import { useSimpleBalance } from '../hooks/useSimpleBalance';

export const SimpleBalanceTest: React.FC = () => {
  const { balances, totalValue, loading, error, loadBalances } = useSimpleBalance();

  // Убираем console.log чтобы избежать бесконечного рендеринга
  // console.log('🧪 SimpleBalanceTest render:', { balances, totalValue, loading, error });

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-white">Simple Balance Test</h3>
      
      {loading && <div className="text-blue-400">Loading...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      
      <div className="space-y-2">
        <div className="text-white">
          <strong>Total Value:</strong> ${totalValue.toFixed(2)}
        </div>
        
        <div className="text-white">
          <strong>Balances:</strong>
          {balances.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {balances.map((balance, index) => (
                <li key={index} className="text-sm">
                  {balance.symbol}: {balance.balance.toFixed(6)} (${balance.valueUSD.toFixed(2)})
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400">No balances loaded</div>
          )}
        </div>
        
        <div className="space-x-2">
          <button
            onClick={loadBalances}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Refresh Balances
          </button>
          <button
            onClick={() => {
              console.log('🔄 Force refresh triggered');
              window.location.reload();
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Force Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
