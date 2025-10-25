import tradingDatabase from '../data/tradingDatabase.json';

export interface DatabaseData {
  bots: any[];
  trades: any[];
  orders: {
    bids: any[];
    asks: any[];
  };
  systemStats: {
    totalBots: number;
    activeOrders: number;
    totalFees: number;
    lastUpdate: number | null;
  };
  botBalances: any[];
  tradeLogs: any[];
}

class JsonDatabaseService {
  private data: DatabaseData = tradingDatabase as DatabaseData;

  // Сохранить данные в JSON файл
  async saveToFile() {
    try {
      // В реальном приложении здесь был бы API запрос для сохранения
      // Пока что просто логируем
      console.log('💾 Сохранение в базу данных:', {
        bots: this.data.bots.length,
        trades: this.data.trades.length,
        orders: this.data.orders.bids.length + this.data.orders.asks.length
      });
      
      // Симуляция сохранения
      localStorage.setItem('tradingDatabase', JSON.stringify(this.data));
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      return false;
    }
  }

  // Загрузить данные из JSON файла
  async loadFromFile() {
    try {
      const saved = localStorage.getItem('tradingDatabase');
      if (saved) {
        this.data = JSON.parse(saved);
        console.log('📂 Загружены данные из базы:', {
          bots: this.data.bots.length,
          trades: this.data.trades.length
        });
      }
      return this.data;
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      return this.data;
    }
  }

  // Добавить сделку
  addTrade(trade: any) {
    this.data.trades.push(trade);
    this.data.tradeLogs.push(trade);
    
    // Ограничиваем количество логов (последние 1000)
    if (this.data.trades.length > 1000) {
      this.data.trades = this.data.trades.slice(-1000);
    }
    if (this.data.tradeLogs.length > 1000) {
      this.data.tradeLogs = this.data.tradeLogs.slice(-1000);
    }
    
    // Автосохранение
    this.saveToFile();
  }

  // Добавить бота
  addBot(bot: any) {
    this.data.bots.push(bot);
    this.saveToFile();
  }

  // Обновить ордера
  updateOrders(orders: any) {
    this.data.orders = orders;
    this.saveToFile();
  }

  // Обновить статистику
  updateStats(stats: any) {
    this.data.systemStats = {
      ...this.data.systemStats,
      ...stats,
      lastUpdate: Date.now()
    };
    this.saveToFile();
  }

  // Получить все данные
  getAllData() {
    return this.data;
  }

  // Получить логи
  getTradeLogs() {
    return this.data.tradeLogs || [];
  }

  // Получить ботов
  getBots() {
    return this.data.bots || [];
  }

  // Получить ордера
  getOrders() {
    return this.data.orders || { bids: [], asks: [] };
  }

  // Получить статистику
  getStats() {
    return this.data.systemStats || {
      totalBots: 0,
      activeOrders: 0,
      totalFees: 0,
      lastUpdate: null
    };
  }

  // Очистить все данные
  clearAll() {
    this.data = {
      bots: [],
      trades: [],
      orders: { bids: [], asks: [] },
      systemStats: {
        totalBots: 0,
        activeOrders: 0,
        totalFees: 0,
        lastUpdate: null
      },
      botBalances: [],
      tradeLogs: []
    };
    this.saveToFile();
  }
}

export const jsonDatabaseService = new JsonDatabaseService();
