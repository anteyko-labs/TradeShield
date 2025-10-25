// ДОБАВЛЕНИЕ ЛИКВИДНОСТИ В DEX КОНТРАКТ
const { ethers } = require('ethers');

async function addLiquidityToContract() {
  console.log('🔧 ДОБАВЛЕНИЕ ЛИКВИДНОСТИ В DEX КОНТРАКТ');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Адреса
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    
    // ABI для DEX
    const DEX_ABI = [
      "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
      "function createPair(address tokenA, address tokenB) external",
      "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)",
      "function owner() external view returns (address)"
    ];
    
    // ABI для токенов
    const TOKEN_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transfer(address to, uint256 amount) returns (bool)"
    ];
    
    console.log('\n📊 ПРОВЕРКА КОНТРАКТА:');
    
    // Проверяем владельца контракта
    const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider);
    const owner = await dexContract.owner();
    console.log(`👤 Владелец контракта: ${owner}`);
    
    // Проверяем текущие резервы
    try {
      const [reserveA, reserveB] = await dexContract.getReserves(USDT_ADDRESS, BTC_ADDRESS);
      console.log(`💰 Текущие резервы: ${ethers.utils.formatUnits(reserveA, 6)} USDT, ${ethers.utils.formatUnits(reserveB, 18)} BTC`);
      
      if (reserveA.gt(0) && reserveB.gt(0)) {
        console.log('✅ Ликвидность уже есть!');
        return;
      }
    } catch (error) {
      console.log('⚠️ Пара не создана или нет резервов');
    }
    
    console.log('\n💡 РЕШЕНИЕ:');
    console.log('1. Нужен приватный ключ владельца контракта');
    console.log('2. Или создать новый контракт с ликвидностью');
    console.log('3. Или использовать другой подход');
    
    console.log('\n🚀 АЛЬТЕРНАТИВНЫЕ РЕШЕНИЯ:');
    console.log('1. Создать простой DEX контракт с ликвидностью');
    console.log('2. Использовать существующий DEX (Uniswap)');
    console.log('3. Создать mock контракт для тестирования');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ АНАЛИЗ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

addLiquidityToContract();
