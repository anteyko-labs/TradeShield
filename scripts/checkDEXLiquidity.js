// ПРОВЕРКА ЛИКВИДНОСТИ DEX КОНТРАКТА
const { ethers } = require('ethers');

async function checkDEXLiquidity() {
  console.log('🔧 ПРОВЕРКА ЛИКВИДНОСТИ DEX КОНТРАКТА');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Адреса
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    const ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
    
    // ABI для DEX
    const DEX_ABI = [
      "function getReserves(address tokenA, address tokenB) view returns (uint256 reserveA, uint256 reserveB)",
      "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) pure returns (uint256 amountOut)",
      "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external",
      "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external"
    ];
    
    const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider);
    
    console.log(`🏦 DEX Контракт: ${DEX_ADDRESS}`);
    
    // Проверяем резервы USDT/BTC
    try {
      const [usdtReserve, btcReserve] = await dexContract.getReserves(USDT_ADDRESS, BTC_ADDRESS);
      console.log(`\n📊 РЕЗЕРВЫ USDT/BTC:`);
      console.log(`💰 USDT: ${ethers.utils.formatUnits(usdtReserve, 6)}`);
      console.log(`💰 BTC: ${ethers.utils.formatUnits(btcReserve, 8)}`);
      
      if (usdtReserve.eq(0) && btcReserve.eq(0)) {
        console.log('❌ НЕТ ЛИКВИДНОСТИ! Нужно добавить ликвидность в DEX');
      } else {
        console.log('✅ Есть ликвидность в DEX');
      }
    } catch (error) {
      console.log(`❌ Ошибка проверки USDT/BTC: ${error.message}`);
    }
    
    // Проверяем резервы USDT/ETH
    try {
      const [usdtReserve, ethReserve] = await dexContract.getReserves(USDT_ADDRESS, ETH_ADDRESS);
      console.log(`\n📊 РЕЗЕРВЫ USDT/ETH:`);
      console.log(`💰 USDT: ${ethers.utils.formatUnits(usdtReserve, 6)}`);
      console.log(`💰 ETH: ${ethers.utils.formatUnits(ethReserve, 18)}`);
      
      if (usdtReserve.eq(0) && ethReserve.eq(0)) {
        console.log('❌ НЕТ ЛИКВИДНОСТИ! Нужно добавить ликвидность в DEX');
      } else {
        console.log('✅ Есть ликвидность в DEX');
      }
    } catch (error) {
      console.log(`❌ Ошибка проверки USDT/ETH: ${error.message}`);
    }
    
    console.log('\n💡 ПРОБЛЕМА:');
    console.log('❌ Если нет ликвидности - боты не могут торговать');
    console.log('❌ Пользователь не может покупать/продавать');
    console.log('❌ Нужно добавить ликвидность в DEX контракт');
    
    console.log('\n🔧 РЕШЕНИЕ:');
    console.log('1. Добавить ликвидность в DEX контракт');
    console.log('2. Или использовать другой подход для торговли');
    console.log('3. Или исправить логику ботов');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ ПРОВЕРКА ЗАВЕРШЕНА');
  console.log('='.repeat(60));
}

checkDEXLiquidity();
