import React, { useState, useEffect } from 'react';
import { tradingEngine } from '../services/tradingEngine';

export const TradingEngineView: React.FC = () => {
  const [stats, setStats] = useState(tradingEngine.getStats());
  const [queuedOrders, setQueuedOrders] = useState(tradingEngine.getQueuedOrders());
  const [feeBalance, setFeeBalance] = useState('0');
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    // Обновляем статистику каждые 5 секунд
    const interval = setInterval(() => {
      setStats(tradingEngine.getStats());
      setQueuedOrders(tradingEngine.getQueuedOrders());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCollectFees = async () => {
    setIsCollecting(true);
    try {
      const txHash = await tradingEngine.collectFees();
      if (txHash) {
        console.log('✅ Комиссии собраны:', txHash);
      }
    } catch (error) {
      console.error('❌ Ошибка сбора комиссий:', error);
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">🚀 Торговый Движок</h2>
        
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400">Ордеров в очереди</div>
            <div className="text-2xl font-bold text-blue-400">{stats.ordersInQueue}</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400">Размер батча</div>
            <div className="text-2xl font-bold text-green-400">{stats.batchSize}</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400">Таймаут (сек)</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.batchTimeout / 1000}</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400">Кошелек комиссий</div>
            <div className="text-xs font-mono text-purple-400 break-all">{stats.feeWallet}</div>
          </div>
        </div>

        {/* Управление */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleCollectFees}
            disabled={isCollecting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg"
          >
            {isCollecting ? 'Сбор...' : '💰 Собрать комиссии'}
          </button>
          
          <button
            onClick={() => tradingEngine.startBatchProcessor()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            ⏰ Запустить батчер
          </button>
        </div>

        {/* Ордера в очереди */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">📋 Ордера в очереди</h3>
          
          {queuedOrders.length === 0 ? (
            <div className="text-gray-400 text-center py-4">Очередь пуста</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queuedOrders.map((order, index) => (
                <div key={order.id} className="bg-gray-600 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex space-x-4">
                    <span className="text-sm text-gray-300">#{index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.side === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {order.side.toUpperCase()}
                    </span>
                    <span className="text-sm text-white">{order.amountIn} {order.tokenIn}</span>
                    <span className="text-sm text-gray-400">→</span>
                    <span className="text-sm text-white">{order.tokenOut}</span>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Логика работы */}
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">⚙️ Как работает движок</h3>
          
          <div className="space-y-2 text-sm text-gray-300">
            <div>1. <span className="text-blue-400">Сбор ордеров</span> - Пользователи создают ордера</div>
            <div>2. <span className="text-green-400">Батчинг</span> - Собираем {stats.batchSize} ордеров в группу</div>
            <div>3. <span className="text-yellow-400">Выполнение</span> - Одна транзакция для всех ордеров</div>
            <div>4. <span className="text-purple-400">Комиссии</span> - 0.2% с каждого ордера → {stats.feeWallet}</div>
            <div>5. <span className="text-red-400">Газ</span> - Платим за транзакцию из собранных комиссий</div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900 rounded-lg">
            <div className="text-blue-200 font-semibold">💡 Экономия газа</div>
            <div className="text-blue-100 text-sm">
              Вместо 10 отдельных транзакций = 1 батч транзакция<br/>
              Экономия: ~90% на газе + прибыль с комиссий
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
