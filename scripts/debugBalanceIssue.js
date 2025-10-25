// ДЕБАГ ПРОБЛЕМЫ С БАЛАНСАМИ
const { ethers } = require('ethers');

async function debugBalanceIssue() {
  console.log('🔧 ДЕБАГ ПРОБЛЕМЫ С БАЛАНСАМИ');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Адреса
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    const ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
    
    // ABI для токенов
    const TOKEN_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ];
    
    // Адрес пользователя
    const userAddress = '0x513756b7ed711c472537cb497833c5d5eb02a3df';
    
    console.log(`👤 Проверяем балансы для: ${userAddress}`);
    
    // Проверяем каждый токен
    const usdtContract = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, provider);
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, provider);
    const ethContract = new ethers.Contract(ETH_ADDRESS, TOKEN_ABI, provider);
    
    console.log('\n📊 РЕАЛЬНЫЕ БАЛАНСЫ В БЛОКЧЕЙНЕ:');
    
    // USDT
    const usdtBalance = await usdtContract.balanceOf(userAddress);
    const usdtDecimals = await usdtContract.decimals();
    const usdtSymbol = await usdtContract.symbol();
    const usdtFormatted = ethers.utils.formatUnits(usdtBalance, usdtDecimals);
    console.log(`💰 ${usdtSymbol}: ${usdtFormatted} (decimals: ${usdtDecimals})`);
    
    // BTC
    const btcBalance = await btcContract.balanceOf(userAddress);
    const btcDecimals = await btcContract.decimals();
    const btcSymbol = await btcContract.symbol();
    const btcFormatted = ethers.utils.formatUnits(btcBalance, btcDecimals);
    console.log(`💰 ${btcSymbol}: ${btcFormatted} (decimals: ${btcDecimals})`);
    
    // ETH
    const ethBalance = await ethContract.balanceOf(userAddress);
    const ethDecimals = await ethContract.decimals();
    const ethSymbol = await ethContract.symbol();
    const ethFormatted = ethers.utils.formatUnits(ethBalance, ethDecimals);
    console.log(`💰 ${ethSymbol}: ${ethFormatted} (decimals: ${ethDecimals})`);
    
    console.log('\n💡 ПРОБЛЕМЫ:');
    console.log('❌ userBalanceService.addBTCTokensToUser() добавляет токены только в память!');
    console.log('❌ Это НЕ реальные токены в блокчейне!');
    console.log('❌ Поэтому "недостаточно BTC" при создании ордеров!');
    
    console.log('\n🔧 РЕШЕНИЕ:');
    console.log('1. Нужно дать РЕАЛЬНЫЕ токены пользователю');
    console.log('2. Или использовать симуляцию торговли');
    console.log('3. Или исправить логику проверки балансов');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ ДЕБАГ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

debugBalanceIssue();
