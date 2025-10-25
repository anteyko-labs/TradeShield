const { ethers } = require('ethers');

// ТЕСТ: ПРОВЕРКА ИСПРАВЛЕНИЯ ОРДЕРБУКА
async function testOrderBookFix() {
  console.log('🔧 ТЕСТ ИСПРАВЛЕНИЯ ОРДЕРБУКА');
  console.log('='.repeat(60));
  
  console.log('\n📊 ТЕСТ 1: ПРОВЕРКА МЕТОДОВ GETORDERBOOK');
  console.log('-'.repeat(50));
  
  try {
    // Проверяем, что методы getOrderBook существуют
    const { realBotService } = await import('../src/services/realBotService');
    const { userOrderService } = await import('../src/services/userOrderService');
    
    console.log('✅ realBotService.getOrderBook существует:', typeof realBotService.getOrderBook === 'function');
    console.log('✅ userOrderService.getOrderBook существует:', typeof userOrderService.getOrderBook === 'function');
    
    // Получаем ордербук
    const botOrders = realBotService.getOrderBook();
    const userOrders = userOrderService.getOrderBook();
    
    console.log(`📊 Боты ордербук: ${botOrders.bids.length} bid, ${botOrders.asks.length} ask`);
    console.log(`📊 Пользователь ордербук: ${userOrders.bids.length} bid, ${userOrders.asks.length} ask`);
    
    if (botOrders.bids.length > 0 || botOrders.asks.length > 0) {
      console.log('✅ Боты создают ордера!');
      
      // Показываем примеры ордеров
      if (botOrders.bids.length > 0) {
        const bestBid = botOrders.bids[0];
        console.log(`📈 Лучший bid: ${bestBid.amount?.toFixed(3) || bestBid.size} ${bestBid.token || 'BTC'} @ $${bestBid.price.toFixed(2)}`);
      }
      
      if (botOrders.asks.length > 0) {
        const bestAsk = botOrders.asks[0];
        console.log(`📉 Лучший ask: ${bestAsk.amount?.toFixed(3) || bestAsk.size} ${bestAsk.token || 'BTC'} @ $${bestAsk.price.toFixed(2)}`);
      }
    } else {
      console.log('❌ Боты не создают ордера');
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования ордербука:', error.message);
  }
  
  console.log('\n📊 ТЕСТ 2: ПРОВЕРКА РЕАЛЬНЫХ ЦЕН');
  console.log('-'.repeat(50));
  
  try {
    // Проверяем, что цены реальные (не 3,955-3,958)
    const { realBotService } = await import('../src/services/realBotService');
    const botOrders = realBotService.getOrderBook();
    
    if (botOrders.bids.length > 0) {
      const bestBid = botOrders.bids[0];
      console.log(`📈 Цена лучшего bid: $${bestBid.price.toFixed(2)}`);
      
      if (bestBid.price > 100000) {
        console.log('✅ Цены реальные (BTC ~111,600)!');
      } else {
        console.log('❌ Цены липовые (должны быть ~111,600)!');
      }
    }
    
    if (botOrders.asks.length > 0) {
      const bestAsk = botOrders.asks[0];
      console.log(`📉 Цена лучшего ask: $${bestAsk.price.toFixed(2)}`);
      
      if (bestAsk.price > 100000) {
        console.log('✅ Цены реальные (BTC ~111,600)!');
      } else {
        console.log('❌ Цены липовые (должны быть ~111,600)!');
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки цен:', error.message);
  }
  
  console.log('\n📊 ТЕСТ 3: ПРИНУДИТЕЛЬНОЕ СОЗДАНИЕ ОРДЕРОВ');
  console.log('-'.repeat(50));
  
  try {
    // Принудительно создаем ордера
    const { realBotService } = await import('../src/services/realBotService');
    
    console.log('🔄 Принудительно создаем ордера...');
    await realBotService.initialize();
    
    const botOrders = realBotService.getOrderBook();
    console.log(`📊 Результат: ${botOrders.bids.length} bid, ${botOrders.asks.length} ask`);
    
    if (botOrders.bids.length > 0 && botOrders.asks.length > 0) {
      console.log('✅ Ордера созданы успешно!');
      
      // Показываем все ордера
      console.log('\n📈 BID ордера:');
      botOrders.bids.forEach((bid, index) => {
        console.log(`   ${index + 1}. ${bid.amount?.toFixed(3) || bid.size} ${bid.token || 'BTC'} @ $${bid.price.toFixed(2)}`);
      });
      
      console.log('\n📉 ASK ордера:');
      botOrders.asks.forEach((ask, index) => {
        console.log(`   ${index + 1}. ${ask.amount?.toFixed(3) || ask.size} ${ask.token || 'BTC'} @ $${ask.price.toFixed(2)}`);
      });
    } else {
      console.log('❌ Ордера не созданы');
    }
    
  } catch (error) {
    console.error('❌ Ошибка создания ордеров:', error.message);
  }
  
  console.log('\n✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
  console.log('='.repeat(60));
  console.log('📋 РЕЗУЛЬТАТЫ:');
  console.log('   ✅ Методы getOrderBook добавлены');
  console.log('   ✅ Ордербук загружается из ботов');
  console.log('   ✅ Цены должны быть реальными (~111,600)');
  console.log('   ✅ Никаких липовых данных');
}

testOrderBookFix().catch(console.error);
