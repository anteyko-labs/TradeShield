// ПРОВЕРКА BTC БАЛАНСА ПОЛЬЗОВАТЕЛЯ
const { ethers } = require('ethers');

async function checkUserBTC() {
  console.log('🔧 ПРОВЕРКА BTC БАЛАНСА ПОЛЬЗОВАТЕЛЯ');
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
      "function decimals() view returns (uint8)"
    ];
    
    // Адрес пользователя (замените на ваш)
    const userAddress = '0x513756b7ed711c472537cb497833c5d5eb02a3df';
    
    console.log(`👤 Проверяем балансы для: ${userAddress}`);
    
    // Проверяем балансы
    const usdtContract = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, provider);
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, provider);
    const ethContract = new ethers.Contract(ETH_ADDRESS, TOKEN_ABI, provider);
    
    const usdtBalance = await usdtContract.balanceOf(userAddress);
    const btcBalance = await btcContract.balanceOf(userAddress);
    const ethBalance = await ethContract.balanceOf(userAddress);
    
    console.log('\n📊 РЕАЛЬНЫЕ БАЛАНСЫ В БЛОКЧЕЙНЕ:');
    console.log(`💰 USDT: ${ethers.utils.formatUnits(usdtBalance, 6)}`);
    console.log(`💰 BTC: ${ethers.utils.formatUnits(btcBalance, 18)}`);
    console.log(`💰 ETH: ${ethers.utils.formatUnits(ethBalance, 18)}`);
    
    if (btcBalance.gt(0)) {
      console.log('✅ У пользователя есть BTC в блокчейне!');
    } else {
      console.log('❌ У пользователя НЕТ BTC в блокчейне!');
      console.log('💡 Проблема: userBalanceService.addBTCTokensToUser() добавляет токены только в память, не в блокчейн!');
    }
    
    // Проверяем DEX контракт
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    const dexUsdtBalance = await usdtContract.balanceOf(DEX_ADDRESS);
    const dexBtcBalance = await btcContract.balanceOf(DEX_ADDRESS);
    
    console.log('\n📊 БАЛАНСЫ В DEX КОНТРАКТЕ:');
    console.log(`💰 USDT: ${ethers.utils.formatUnits(dexUsdtBalance, 6)}`);
    console.log(`💰 BTC: ${ethers.utils.formatUnits(dexBtcBalance, 18)}`);
    
    if (dexUsdtBalance.gt(0) && dexBtcBalance.gt(0)) {
      console.log('✅ В DEX контракте есть ликвидность!');
    } else {
      console.log('❌ В DEX контракте НЕТ ликвидности!');
      console.log('💡 Проблема: Нет ликвидности для торговли!');
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки балансов:', error.message);
  }
  
  console.log('\n✅ ПРОВЕРКА ЗАВЕРШЕНА');
  console.log('='.repeat(60));
}

checkUserBTC();
