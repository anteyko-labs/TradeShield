// Тестирование системы ордербука
function testOrderBook() {
  console.log('📊 ТЕСТИРОВАНИЕ СИСТЕМЫ ОРДЕРБУКА');
  console.log('='.repeat(60));
  
  // Симуляция ордербука
  class TestOrderBook {
    constructor() {
      this.orders = { bids: [], asks: [] };
    }
    
    // Добавить ордер
    addOrder(order) {
      if (order.side === 'buy') {
        this.orders.bids.push(order);
        this.orders.bids.sort((a, b) => b.price - a.price); // Сортировка по убыванию цены
      } else {
        this.orders.asks.push(order);
        this.orders.asks.sort((a, b) => a.price - b.price); // Сортировка по возрастанию цены
      }
      
      console.log(`📝 Добавлен ${order.side} ордер: ${order.amount} ${order.token} @ $${order.price}`);
    }
    
    // Получить топ ордера
    getTopOrders(count = 9) {
      return {
        bids: this.orders.bids.slice(0, count),
        asks: this.orders.asks.slice(0, count)
      };
    }
    
    // Получить статистику
    getStats() {
      return {
        totalBids: this.orders.bids.length,
        totalAsks: this.orders.asks.length,
        bestBid: this.orders.bids[0]?.price || 0,
        bestAsk: this.orders.asks[0]?.price || 0,
        spread: this.orders.asks[0]?.price - this.orders.bids[0]?.price || 0
      };
    }
  }
  
  console.log('\n📊 ТЕСТ 1: СОЗДАНИЕ ОРДЕРБУКА');
  console.log('-'.repeat(50));
  
  const orderBook = new TestOrderBook();
  
  console.log('\n📊 ТЕСТ 2: ДОБАВЛЕНИЕ BID ОРДЕРОВ (ПОКУПКА)');
  console.log('-'.repeat(50));
  
  // Создаем bid ордера от ботов
  const botBids = [
    { id: 'bid1', botName: 'AlphaTrader', side: 'buy', token: 'BTC', amount: 0.5, price: 64000, total: 32000 },
    { id: 'bid2', botName: 'BetaBot', side: 'buy', token: 'BTC', amount: 0.3, price: 64500, total: 19350 },
    { id: 'bid3', botName: 'GammaGains', side: 'buy', token: 'BTC', amount: 0.8, price: 63500, total: 50800 },
    { id: 'bid4', botName: 'DeltaDex', side: 'buy', token: 'BTC', amount: 0.2, price: 65000, total: 13000 }
  ];
  
  botBids.forEach(bid => orderBook.addOrder(bid));
  
  console.log('\n📊 ТЕСТ 3: ДОБАВЛЕНИЕ ASK ОРДЕРОВ (ПРОДАЖА)');
  console.log('-'.repeat(50));
  
  // Создаем ask ордера от ботов
  const botAsks = [
    { id: 'ask1', botName: 'AlphaTrader', side: 'sell', token: 'BTC', amount: 0.4, price: 66000, total: 26400 },
    { id: 'ask2', botName: 'BetaBot', side: 'sell', token: 'BTC', amount: 0.6, price: 65500, total: 39300 },
    { id: 'ask3', botName: 'GammaGains', side: 'sell', token: 'BTC', amount: 0.3, price: 67000, total: 20100 },
    { id: 'ask4', botName: 'DeltaDex', side: 'sell', token: 'BTC', amount: 0.7, price: 66500, total: 46550 }
  ];
  
  botAsks.forEach(ask => orderBook.addOrder(ask));
  
  console.log('\n📊 ТЕСТ 4: ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЬСКИХ ОРДЕРОВ');
  console.log('-'.repeat(50));
  
  // Пользователь создает лимитный sell ордер
  const userSellOrder = {
    id: 'user_sell_1',
    botName: 'User',
    side: 'sell',
    token: 'BTC',
    amount: 1.0,
    price: 65800,
    total: 65800
  };
  
  orderBook.addOrder(userSellOrder);
  
  // Пользователь создает лимитный buy ордер
  const userBuyOrder = {
    id: 'user_buy_1',
    botName: 'User',
    side: 'buy',
    token: 'BTC',
    amount: 0.5,
    price: 64200,
    total: 32100
  };
  
  orderBook.addOrder(userBuyOrder);
  
  console.log('\n📊 ТЕСТ 5: ОТОБРАЖЕНИЕ ОРДЕРБУКА');
  console.log('-'.repeat(50));
  
  const topOrders = orderBook.getTopOrders(5);
  const stats = orderBook.getStats();
  
  console.log('📈 ТОП BID ОРДЕРА (покупка):');
  topOrders.bids.forEach((order, i) => {
    console.log(`  ${i+1}. ${order.botName}: ${order.amount} BTC @ $${order.price.toLocaleString()}`);
  });
  
  console.log('\n📉 ТОП ASK ОРДЕРА (продажа):');
  topOrders.asks.forEach((order, i) => {
    console.log(`  ${i+1}. ${order.botName}: ${order.amount} BTC @ $${order.price.toLocaleString()}`);
  });
  
  console.log('\n📊 СТАТИСТИКА ОРДЕРБУКА:');
  console.log(`   Всего bid ордеров: ${stats.totalBids}`);
  console.log(`   Всего ask ордеров: ${stats.totalAsks}`);
  console.log(`   Лучший bid: $${stats.bestBid.toLocaleString()}`);
  console.log(`   Лучший ask: $${stats.bestAsk.toLocaleString()}`);
  console.log(`   Спред: $${stats.spread.toLocaleString()}`);
  
  console.log('\n✅ ТЕСТИРОВАНИЕ ОРДЕРБУКА ЗАВЕРШЕНО');
}

testOrderBook();
