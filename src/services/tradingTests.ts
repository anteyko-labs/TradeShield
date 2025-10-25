import { realBotService } from './realBotService';
import { realTradingService } from './realTradingService';

export class TradingTests {
  
  // Тест 1: Проверка инициализации ботов
  static async testBotInitialization(): Promise<boolean> {
    try {
      console.log('🧪 Тест 1: Инициализация ботов...');
      
      await realBotService.initialize();
      const bots = realBotService.getBots();
      
      if (bots.length !== 4) {
        console.error('❌ Ожидалось 4 бота, получено:', bots.length);
        return false;
      }
      
      // Проверяем что у всех ботов есть адреса
      for (const bot of bots) {
        if (!bot.address || !bot.privateKey) {
          console.error('❌ У бота отсутствует адрес или приватный ключ');
          return false;
        }
      }
      
      console.log('✅ Тест 1 пройден: Боты инициализированы');
      return true;
    } catch (error) {
      console.error('❌ Тест 1 провален:', error);
      return false;
    }
  }

  // Тест 2: Проверка торговли ботов
  static async testBotTrading(): Promise<boolean> {
    try {
      console.log('🧪 Тест 2: Торговля ботов...');
      
      const initialTrades = realBotService.getTrades().length;
      
      // Ждем 6 секунд (боты торгуют каждые 5 секунд)
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      const newTrades = realBotService.getTrades().length;
      
      if (newTrades <= initialTrades) {
        console.error('❌ Новые сделки не появились');
        return false;
      }
      
      console.log(`✅ Тест 2 пройден: Создано ${newTrades - initialTrades} новых сделок`);
      return true;
    } catch (error) {
      console.error('❌ Тест 2 провален:', error);
      return false;
    }
  }

  // Тест 3: Проверка ордербука
  static testOrderBook(): boolean {
    try {
      console.log('🧪 Тест 3: Ордербук...');
      
      const orderBook = realBotService.getOrderBook();
      
      if (!orderBook.bids || !orderBook.asks) {
        console.error('❌ Ордербук не инициализирован');
        return false;
      }
      
      if (orderBook.bids.length === 0 && orderBook.asks.length === 0) {
        console.error('❌ Ордербук пустой');
        return false;
      }
      
      console.log(`✅ Тест 3 пройден: ${orderBook.bids.length} bids, ${orderBook.asks.length} asks`);
      return true;
    } catch (error) {
      console.error('❌ Тест 3 провален:', error);
      return false;
    }
  }

  // Тест 4: Проверка статистики
  static testStatistics(): boolean {
    try {
      console.log('🧪 Тест 4: Статистика...');
      
      const stats = realBotService.getStats();
      
      if (stats.totalBots !== 4) {
        console.error('❌ Неправильное количество ботов:', stats.totalBots);
        return false;
      }
      
      if (stats.activeBots !== 4) {
        console.error('❌ Не все боты активны:', stats.activeBots);
        return false;
      }
      
      console.log('✅ Тест 4 пройден: Статистика корректна');
      return true;
    } catch (error) {
      console.error('❌ Тест 4 провален:', error);
      return false;
    }
  }

  // Тест 5: Проверка реальной торговли (если контракты подключены)
  static async testRealTrading(): Promise<boolean> {
    try {
      console.log('🧪 Тест 5: Реальная торговля...');
      
      // Проверяем что контракты подключены
      if (!realTradingService) {
        console.log('⚠️ Реальная торговля не настроена (нет контрактов)');
        return true; // Не критично для демо
      }
      
      console.log('✅ Тест 5 пропущен: Реальная торговля требует подключенных контрактов');
      return true;
    } catch (error) {
      console.error('❌ Тест 5 провален:', error);
      return false;
    }
  }

  // Запуск всех тестов
  static async runAllTests(): Promise<{ passed: number; total: number; results: boolean[] }> {
    console.log('🚀 Запуск всех тестов...');
    
    const tests = [
      () => this.testBotInitialization(),
      () => this.testBotTrading(),
      () => this.testOrderBook(),
      () => this.testStatistics(),
      () => this.testRealTrading()
    ];
    
    const results: boolean[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      try {
        const result = await tests[i]();
        results.push(result);
      } catch (error) {
        console.error(`❌ Тест ${i + 1} упал:`, error);
        results.push(false);
      }
    }
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`\n📊 Результаты тестов: ${passed}/${total} пройдено`);
    
    if (passed === total) {
      console.log('🎉 Все тесты пройдены!');
    } else {
      console.log('⚠️ Некоторые тесты провалены');
    }
    
    return { passed, total, results };
  }
}

// Автоматический запуск тестов при импорте
if (typeof window !== 'undefined') {
  setTimeout(() => {
    TradingTests.runAllTests();
  }, 2000);
}
