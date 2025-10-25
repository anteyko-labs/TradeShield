// ОБЪЯСНЕНИЕ МЕТЧИНГА ОРДЕРОВ
console.log('🔧 ОБЪЯСНЕНИЕ МЕТЧИНГА ОРДЕРОВ');
console.log('='.repeat(60));

console.log('\n📊 КАК ПРОИСХОДИТ МЕТЧИНГ:');
console.log('1. Пользователь создает ордер (buy/sell)');
console.log('2. Система ищет подходящие ордера ботов');
console.log('3. Находит лучший матч по цене');
console.log('4. Исполняет сделку');
console.log('5. Обновляет балансы');

console.log('\n🔄 АЛГОРИТМ МЕТЧИНГА:');
console.log('✅ ПОКУПКА (user buy):');
console.log('   - Ищем ask ордера ботов');
console.log('   - Цена бота <= цены пользователя');
console.log('   - Выбираем лучший (самый дешевый)');
console.log('   - Исполняем сделку');

console.log('✅ ПРОДАЖА (user sell):');
console.log('   - Ищем bid ордера ботов');
console.log('   - Цена бота >= цены пользователя');
console.log('   - Выбираем лучший (самый дорогой)');
console.log('   - Исполняем сделку');

console.log('\n💡 ПРИМЕР МЕТЧИНГА:');
console.log('👤 Пользователь: BUY 1 BTC @ $110,000');
console.log('🤖 Бот: SELL 1 BTC @ $109,500');
console.log('✅ МАТЧ! Исполняем по $109,500');
console.log('💰 Пользователь получает 1 BTC');
console.log('💰 Бот получает $109,500');

console.log('\n🔧 БАТЧИНГ В DEX:');
console.log('✅ До 10 ордеров за одну транзакцию');
console.log('✅ Комиссия 0.2% с каждой сделки');
console.log('✅ Автоматическое исполнение');
console.log('✅ Обновление резервов');

console.log('\n🚀 ИНСТРУКЦИИ:');
console.log('1. Откройте браузер: http://localhost:5173');
console.log('2. Подключите кошелек');
console.log('3. Создайте ордер');
console.log('4. Система автоматически найдет матч');
console.log('5. Сделка исполнится');

console.log('\n✅ МЕТЧИНГ ГОТОВ!');
console.log('='.repeat(60));
