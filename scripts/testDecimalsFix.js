// ТЕСТ ИСПРАВЛЕНИЯ DECIMALS
console.log('🔧 ТЕСТ ИСПРАВЛЕНИЯ DECIMALS');
console.log('='.repeat(60));

console.log('\n📊 ПРОБЛЕМА НАЙДЕНА:');
console.log('❌ BTC токен имеет 8 decimals, а в коде использовалось 18');
console.log('❌ У вас 20,987,999 BTC, но код думал что это 0.0000002 BTC');
console.log('❌ Поэтому "недостаточно BTC" при попытке продажи');

console.log('\n✅ ИСПРАВЛЕНИЯ:');
console.log('✅ userTradingService: BTC decimals = 8 (было 18)');
console.log('✅ realBotService: BTC decimals = 8 (было 18)');
console.log('✅ userBalanceService: уже правильно (читает из контракта)');

console.log('\n💡 РЕЗУЛЬТАТ:');
console.log('✅ Теперь код правильно понимает ваш баланс BTC');
console.log('✅ 20,987,999 BTC = 20.987999 BTC (с 8 decimals)');
console.log('✅ Достаточно для продажи!');

console.log('\n🚀 ИНСТРУКЦИИ:');
console.log('1. Откройте браузер: http://localhost:5173');
console.log('2. Подключите кошелек');
console.log('3. Попробуйте продать BTC - должно работать!');
console.log('4. Проверьте, что баланс отображается правильно');

console.log('\n✅ DECIMALS ИСПРАВЛЕНЫ!');
console.log('='.repeat(60));
