import React, { useState } from 'react';
import { tradingEngine } from '../services/tradingEngine';

export const BatchTradingTest: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const createTestOrders = async () => {
    setIsCreating(true);
    setTestResults([]);
    
    try {
      console.log('🧪 Создание тестовых ордеров...');
      
      // Создаем 5 тестовых ордеров
      const testOrders = [
        {
          id: `test_1_${Date.now()}`,
          user: '0x482F4D85145f8A5494583e24efE2944C643825f6', // AlphaTrader
          tokenIn: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6', // USDT
          tokenOut: '0xC941593909348e941420D5404Ab00b5363b1dDB4', // BTC
          amountIn: '1000000', // 1 USDT (6 decimals)
          minAmountOut: '0',
          side: 'buy' as const,
          timestamp: Date.now()
        },
        {
          id: `test_2_${Date.now()}`,
          user: '0x78ACAcBf97666719345Ea5aCcb302C6F2283a76E', // BetaBot
          tokenIn: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6', // USDT
          tokenOut: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb', // ETH
          amountIn: '2000000', // 2 USDT
          minAmountOut: '0',
          side: 'buy' as const,
          timestamp: Date.now()
        },
        {
          id: `test_3_${Date.now()}`,
          user: '0x2bdE3eB40333319f53924A27C95d94122F1b9F52', // GammaGains
          tokenIn: '0xC941593909348e941420D5404Ab00b5363b1dDB4', // BTC
          tokenOut: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6', // USDT
          amountIn: '1000000000000000', // 0.001 BTC (18 decimals)
          minAmountOut: '0',
          side: 'sell' as const,
          timestamp: Date.now()
        },
        {
          id: `test_4_${Date.now()}`,
          user: '0x9b561AF79907654F0c31e5AE3497348520c73CF9', // DeltaDex
          tokenIn: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb', // ETH
          tokenOut: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6', // USDT
          amountIn: '1000000000000000000', // 1 ETH
          minAmountOut: '0',
          side: 'sell' as const,
          timestamp: Date.now()
        },
        {
          id: `test_5_${Date.now()}`,
          user: '0x482F4D85145f8A5494583e24efE2944C643825f6', // AlphaTrader
          tokenIn: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6', // USDT
          tokenOut: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb', // ETH
          amountIn: '5000000', // 5 USDT
          minAmountOut: '0',
          side: 'buy' as const,
          timestamp: Date.now()
        }
      ];

      // Добавляем ордера в очередь
      for (const order of testOrders) {
        await tradingEngine.addOrder(order);
        setTestResults(prev => [...prev, `✅ Ордер ${order.id} добавлен в очередь`]);
      }

      setTestResults(prev => [...prev, '🎯 Все ордера добавлены! Батч будет выполнен автоматически...']);
      
    } catch (error) {
      console.error('❌ Ошибка создания тестовых ордеров:', error);
      setTestResults(prev => [...prev, `❌ Ошибка: ${error}`]);
    } finally {
      setIsCreating(false);
    }
  };

  const getEngineStats = () => {
    const stats = tradingEngine.getStats();
    const orders = tradingEngine.getQueuedOrders();
    
    return {
      ...stats,
      orders: orders.map(order => ({
        id: order.id,
        user: order.user.slice(0, 6) + '...',
        side: order.side,
        amount: order.amountIn,
        tokenIn: order.tokenIn.slice(0, 6) + '...',
        tokenOut: order.tokenOut.slice(0, 6) + '...'
      }))
    };
  };

  const stats = getEngineStats();

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">🧪 Тест Батчинга Ордеров</h2>
        
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

        {/* Кнопки управления */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={createTestOrders}
            disabled={isCreating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold"
          >
            {isCreating ? 'Создание...' : '🧪 Создать тестовые ордера'}
          </button>
          
          <button
            onClick={() => tradingEngine.startBatchProcessor()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
          >
            ⏰ Запустить батчер
          </button>
        </div>

        {/* Результаты тестов */}
        {testResults.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">📋 Результаты тестов</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-300">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ордера в очереди */}
        {stats.orders.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">📋 Ордера в очереди</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.orders.map((order, index) => (
                <div key={order.id} className="bg-gray-600 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex space-x-4">
                    <span className="text-sm text-gray-300">#{index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.side === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {order.side.toUpperCase()}
                    </span>
                    <span className="text-sm text-white">{order.amount}</span>
                    <span className="text-sm text-gray-400">→</span>
                    <span className="text-sm text-white">{order.tokenOut}</span>
                    <span className="text-sm text-gray-400">by {order.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Инструкции */}
        <div className="mt-6 bg-blue-900 rounded-lg p-4">
          <div className="text-blue-200 font-semibold mb-2">📝 Как тестировать:</div>
          <div className="text-blue-100 text-sm space-y-1">
            <div>1. Нажмите "Создать тестовые ордера" - создастся 5 тестовых ордеров</div>
            <div>2. Нажмите "Запустить батчер" - запустится автоматический батчер</div>
            <div>3. Когда наберется {stats.batchSize} ордеров - выполнится батч транзакция</div>
            <div>4. Комиссии (0.2% с каждого) перейдут на {stats.feeWallet}</div>
            <div>5. Экономия газа: ~90% (1 транзакция вместо 5)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
