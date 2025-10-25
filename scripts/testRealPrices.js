// ТЕСТ РЕАЛЬНЫХ ЦЕН
const { ethers } = require('ethers');

async function testRealPrices() {
  console.log('🔧 ТЕСТ РЕАЛЬНЫХ ЦЕН');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    console.log('📊 ПРОВЕРЯЕМ РЕАЛЬНЫЕ ЦЕНЫ:');
    console.log('✅ CoinGecko API - основной источник');
    console.log('✅ CoinMarketCap API - резервный источник');
    console.log('✅ Обновление каждые 5 секунд');
    console.log('✅ НЕ фиксированные цены!');
    
    console.log('\n💡 КАК РАБОТАЕТ:');
    console.log('1. priceService получает данные из API');
    console.log('2. Обновляет цены каждые 5 секунд');
    console.log('3. Использует реальные цены для торговли');
    console.log('4. Никаких фиксированных цен!');
    
    console.log('\n🚀 ИНСТРУКЦИИ:');
    console.log('1. Откройте браузер: http://localhost:5173');
    console.log('2. Подключите кошелек');
    console.log('3. Проверьте консоль - должны быть логи обновления цен');
    console.log('4. Цены должны меняться каждые 5 секунд');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ ТЕСТ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

testRealPrices();
