import { RealBot, RealTrade, RealOrder } from './realBotService';

export interface PersistentData {
  bots: RealBot[];
  trades: RealTrade[];
  orders: { bids: RealOrder[]; asks: RealOrder[] };
  systemStats: {
    totalBots: number;
    activeOrders: number;
    totalFees: number;
    totalVolume: number;
    lastUpdate: number;
  };
  botBalances: { [botId: string]: { USDT: number; BTC: number; ETH: number } };
  tradeLogs: RealTrade[];
  userTrades: {
    userId: string;
    trades: RealTrade[];
  }[];
}

class PersistentStorageService {
  private data: PersistentData = {
    bots: [],
    trades: [],
    orders: { bids: [], asks: [] },
    systemStats: {
      totalBots: 0,
      activeOrders: 0,
      totalFees: 0,
      totalVolume: 0,
      lastUpdate: Date.now()
    },
    botBalances: {},
    tradeLogs: [],
    userTrades: []
  };

  private readonly STORAGE_KEY = 'tradingSystemData';
  private readonly MAX_TRADES = 10000; // Максимум 10,000 сделок
  private readonly MAX_LOGS = 50000;   // Максимум 50,000 логов

  constructor() {
    this.loadFromStorage();
  }

  // Загрузить данные из localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        console.log('📁 Данные загружены из localStorage');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      this.data = this.getDefaultData();
    }
  }

  // Сохранить данные в localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      console.log('💾 Данные сохранены в localStorage');
    } catch (error) {
      console.error('❌ Ошибка сохранения данных:', error);
    }
  }

  // Получить данные по умолчанию
  private getDefaultData(): PersistentData {
    return {
      bots: [],
      trades: [],
      orders: { bids: [], asks: [] },
      systemStats: {
        totalBots: 0,
        activeOrders: 0,
        totalFees: 0,
        totalVolume: 0,
        lastUpdate: Date.now()
      },
      botBalances: {},
      tradeLogs: [],
      userTrades: []
    };
  }

  // ========== БОТЫ ==========
  
  saveBots(bots: RealBot[]): void {
    this.data.bots = bots;
    this.data.systemStats.totalBots = bots.length;
    this.data.systemStats.lastUpdate = Date.now();
    this.saveToStorage();
  }

  getBots(): RealBot[] {
    return this.data.bots;
  }

  // ========== СДЕЛКИ ==========
  
  addTrade(trade: RealTrade): void {
    this.data.trades.push(trade);
    this.data.tradeLogs.push(trade);
    
    // Ограничиваем количество сделок
    if (this.data.trades.length > this.MAX_TRADES) {
      this.data.trades = this.data.trades.slice(-this.MAX_TRADES);
    }
    
    if (this.data.tradeLogs.length > this.MAX_LOGS) {
      this.data.tradeLogs = this.data.tradeLogs.slice(-this.MAX_LOGS);
    }
    
    this.data.systemStats.lastUpdate = Date.now();
    this.saveToStorage();
  }

  getTrades(): RealTrade[] {
    return this.data.trades;
  }

  getTradeLogs(): RealTrade[] {
    return this.data.tradeLogs;
  }

  // ========== ОРДЕРА ==========
  
  saveOrders(orders: { bids: RealOrder[]; asks: RealOrder[] }): void {
    this.data.orders = orders;
    this.data.systemStats.activeOrders = orders.bids.length + orders.asks.length;
    this.data.systemStats.lastUpdate = Date.now();
    this.saveToStorage();
  }

  getOrders(): { bids: RealOrder[]; asks: RealOrder[] } {
    return this.data.orders;
  }

  // ========== СТАТИСТИКА ==========
  
  updateStats(stats: {
    totalBots: number;
    activeOrders: number;
    totalFees: number;
    totalVolume: number;
  }): void {
    this.data.systemStats = {
      ...stats,
      lastUpdate: Date.now()
    };
    this.saveToStorage();
  }

  getStats() {
    return this.data.systemStats;
  }

  // ========== БАЛАНСЫ БОТОВ ==========
  
  updateBotBalances(botId: string, balances: { USDT: number; BTC: number; ETH: number }): void {
    this.data.botBalances[botId] = balances;
    this.data.systemStats.lastUpdate = Date.now();
    this.saveToStorage();
  }

  getBotBalances(): { [botId: string]: { USDT: number; BTC: number; ETH: number } } {
    return this.data.botBalances;
  }

  // ========== ПОЛЬЗОВАТЕЛЬСКИЕ СДЕЛКИ ==========
  
  addUserTrade(userId: string, trade: RealTrade): void {
    let userTrades = this.data.userTrades.find(ut => ut.userId === userId);
    
    if (!userTrades) {
      userTrades = { userId, trades: [] };
      this.data.userTrades.push(userTrades);
    }
    
    userTrades.trades.push(trade);
    
    // Ограничиваем количество сделок пользователя
    if (userTrades.trades.length > 1000) {
      userTrades.trades = userTrades.trades.slice(-1000);
    }
    
    this.data.systemStats.lastUpdate = Date.now();
    this.saveToStorage();
  }

  getUserTrades(userId: string): RealTrade[] {
    const userTrades = this.data.userTrades.find(ut => ut.userId === userId);
    return userTrades ? userTrades.trades : [];
  }

  // ========== ЭКСПОРТ/ИМПОРТ ==========
  
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      this.data = importedData;
      this.saveToStorage();
      console.log('📥 Данные импортированы');
      return true;
    } catch (error) {
      console.error('❌ Ошибка импорта данных:', error);
      return false;
    }
  }

  // ========== ОЧИСТКА ==========
  
  clearAllData(): void {
    this.data = this.getDefaultData();
    this.saveToStorage();
    console.log('🗑️ Все данные очищены');
  }

  clearOldData(daysToKeep: number = 30): void {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    this.data.trades = this.data.trades.filter(trade => trade.timestamp > cutoffTime);
    this.data.tradeLogs = this.data.tradeLogs.filter(trade => trade.timestamp > cutoffTime);
    
    // Очищаем старые пользовательские сделки
    this.data.userTrades.forEach(userTrades => {
      userTrades.trades = userTrades.trades.filter(trade => trade.timestamp > cutoffTime);
    });
    
    this.data.systemStats.lastUpdate = Date.now();
    this.saveToStorage();
    console.log(`🗑️ Данные старше ${daysToKeep} дней очищены`);
  }

  // ========== СТАТИСТИКА ХРАНЕНИЯ ==========
  
  getStorageStats() {
    const dataSize = JSON.stringify(this.data).length;
    const tradesCount = this.data.trades.length;
    const logsCount = this.data.tradeLogs.length;
    const usersCount = this.data.userTrades.length;
    
    return {
      dataSizeKB: Math.round(dataSize / 1024),
      tradesCount,
      logsCount,
      usersCount,
      lastUpdate: this.data.systemStats.lastUpdate
    };
  }
}

export const persistentStorageService = new PersistentStorageService();
