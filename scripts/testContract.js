// ТЕСТ КОНТРАКТА DEX
const { ethers } = require('ethers');

async function testContract() {
  console.log('🔧 ТЕСТ КОНТРАКТА DEX');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Адреса
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    
    // ABI для проверки
    const DEX_ABI = [
      "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)",
      "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)"
    ];
    
    const USDT_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    const BTC_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    // Создаем контракты
    const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider);
    const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
    const btcContract = new ethers.Contract(BTC_ADDRESS, BTC_ABI, provider);
    
    console.log('\n📊 ПРОВЕРКА КОНТРАКТА:');
    
    // Проверяем балансы токенов в контракте
    const usdtBalance = await usdtContract.balanceOf(DEX_ADDRESS);
    const btcBalance = await btcContract.balanceOf(DEX_ADDRESS);
    
    console.log(`💰 USDT в контракте: ${ethers.utils.formatUnits(usdtBalance, 6)}`);
    console.log(`💰 BTC в контракте: ${ethers.utils.formatUnits(btcBalance, 18)}`);
    
    // Проверяем, есть ли ликвидность
    if (usdtBalance.gt(0) && btcBalance.gt(0)) {
      console.log('✅ Ликвидность есть!');
      
      // Тестируем getAmountOut
      const amountIn = ethers.utils.parseUnits('1000', 6); // 1000 USDT
      try {
        const amountOut = await dexContract.getAmountOut(USDT_ADDRESS, BTC_ADDRESS, amountIn);
        console.log(`📈 1000 USDT = ${ethers.utils.formatUnits(amountOut, 18)} BTC`);
      } catch (error) {
        console.log('❌ Ошибка getAmountOut:', error.message);
      }
    } else {
      console.log('❌ Нет ликвидности в контракте!');
      console.log('💡 Нужно добавить ликвидность в DEX контракт');
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования контракта:', error.message);
  }
  
  console.log('\n✅ ТЕСТ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

testContract();
