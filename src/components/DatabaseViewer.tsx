import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, RefreshCw } from 'lucide-react';
import { jsonDatabaseService } from '../services/jsonDatabaseService';

export const DatabaseViewer: React.FC = () => {
  const [databaseStats, setDatabaseStats] = useState({
    bots: 0,
    trades: 0,
    orders: 0,
    lastUpdate: null as number | null
  });

  const [isLoading, setIsLoading] = useState(false);

  // Загружаем статистику базы данных
  const loadDatabaseStats = async () => {
    setIsLoading(true);
    try {
      const data = jsonDatabaseService.getAllData();
      setDatabaseStats({
        bots: data.bots.length,
        trades: data.trades.length,
        orders: data.orders.bids.length + data.orders.asks.length,
        lastUpdate: data.systemStats.lastUpdate
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  // Экспорт данных
  const exportData = () => {
    const data = jsonDatabaseService.getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-database-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Очистка базы данных
  const clearDatabase = () => {
    if (window.confirm('Вы уверены, что хотите очистить всю базу данных? Это действие нельзя отменить.')) {
      jsonDatabaseService.clearAll();
      loadDatabaseStats();
    }
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Никогда';
    return new Date(timestamp).toLocaleString('ru-RU');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">База данных торговли</h2>
          </div>
          <button
            onClick={loadDatabaseStats}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Боты</div>
            <div className="text-2xl font-bold text-blue-400">{databaseStats.bots}</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Сделки</div>
            <div className="text-2xl font-bold text-green-400">{databaseStats.trades}</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Ордера</div>
            <div className="text-2xl font-bold text-orange-400">{databaseStats.orders}</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Последнее обновление</div>
            <div className="text-sm font-semibold text-gray-300">
              {formatTime(databaseStats.lastUpdate)}
            </div>
          </div>
        </div>

        {/* Информация о хранении */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">💾 Где сохраняются данные:</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div>• <strong>localStorage</strong> - основное хранилище в браузере</div>
            <div>• <strong>JSON файл</strong> - резервная копия (tradingDatabase.json)</div>
            <div>• <strong>Автосохранение</strong> - каждые 2-5 секунд при торговле</div>
            <div>• <strong>Персистентность</strong> - данные сохраняются между сессиями</div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт данных</span>
          </button>
          
          <button
            onClick={clearDatabase}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
            <span>Очистить базу</span>
          </button>
        </div>
      </div>

      {/* Информация о файлах */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📁 Структура файлов:</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span><code>src/data/tradingDatabase.json</code> - основной файл базы данных</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span><code>src/services/jsonDatabaseService.ts</code> - сервис для работы с базой</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span><code>localStorage</code> - кэш в браузере пользователя</span>
          </div>
        </div>
      </div>
    </div>
  );
};
