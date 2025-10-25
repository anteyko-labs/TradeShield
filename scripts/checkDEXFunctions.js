// ПРОВЕРКА ФУНКЦИЙ DEX КОНТРАКТА
const { ethers } = require('ethers');

async function checkDEXFunctions() {
  console.log('🔧 ПРОВЕРКА ФУНКЦИЙ DEX КОНТРАКТА');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Адрес DEX
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    
    console.log(`🏦 DEX Контракт: ${DEX_ADDRESS}`);
    
    // Попробуем разные функции
    const functions = [
      'addLiquidity',
      'removeLiquidity', 
      'swap',
      'getAmountOut',
      'getReserves',
      'balanceOf',
      'totalSupply'
    ];
    
    console.log('\n📊 ПРОВЕРЯЕМ ФУНКЦИИ:');
    
    for (const funcName of functions) {
      try {
        // Создаем ABI для функции
        const abi = [`function ${funcName}() view returns (uint256)`];
        const contract = new ethers.Contract(DEX_ADDRESS, abi, provider);
        
        // Пытаемся вызвать функцию
        await contract[funcName]();
        console.log(`✅ ${funcName} - функция существует`);
      } catch (error) {
        console.log(`❌ ${funcName} - ${error.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n💡 ВЫВОД:');
    console.log('❌ DEX контракт может не поддерживать addLiquidity');
    console.log('❌ Или функция работает по-другому');
    console.log('❌ Нужно проверить исходный код контракта');
    
    console.log('\n🔧 РЕШЕНИЕ:');
    console.log('1. Проверить исходный код DEX контракта');
    console.log('2. Или использовать другой подход для торговли');
    console.log('3. Или создать новый DEX контракт');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ ПРОВЕРКА ЗАВЕРШЕНА');
  console.log('='.repeat(60));
}

checkDEXFunctions();
