// ДЕТАЛЬНАЯ ПРОВЕРКА БАЛАНСОВ BTC
const { ethers } = require('ethers');

async function checkDetailedBalances() {
  console.log('🔧 ДЕТАЛЬНАЯ ПРОВЕРКА БАЛАНСОВ BTC');
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
      "function symbol() view returns (string)",
      "function name() view returns (string)"
    ];
    
    // Адрес пользователя
    const userAddress = '0x513756b7ed711c472537cb497833c5d5eb02a3df';
    
    console.log(`👤 Проверяем балансы для: ${userAddress}`);
    
    // Проверяем каждый токен детально
    const usdtContract = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, provider);
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, provider);
    const ethContract = new ethers.Contract(ETH_ADDRESS, TOKEN_ABI, provider);
    
    console.log('\n📊 ДЕТАЛЬНЫЕ БАЛАНСЫ:');
    
    // USDT
    try {
      const usdtBalance = await usdtContract.balanceOf(userAddress);
      const usdtDecimals = await usdtContract.decimals();
      const usdtSymbol = await usdtContract.symbol();
      const usdtName = await usdtContract.name();
      const usdtFormatted = ethers.utils.formatUnits(usdtBalance, usdtDecimals);
      
      console.log(`💰 ${usdtName} (${usdtSymbol}):`);
      console.log(`   Raw: ${usdtBalance.toString()}`);
      console.log(`   Decimals: ${usdtDecimals}`);
      console.log(`   Formatted: ${usdtFormatted}`);
    } catch (error) {
      console.log(`❌ Ошибка USDT: ${error.message}`);
    }
    
    // BTC
    try {
      const btcBalance = await btcContract.balanceOf(userAddress);
      const btcDecimals = await btcContract.decimals();
      const btcSymbol = await btcContract.symbol();
      const btcName = await btcContract.name();
      const btcFormatted = ethers.utils.formatUnits(btcBalance, btcDecimals);
      
      console.log(`\n💰 ${btcName} (${btcSymbol}):`);
      console.log(`   Raw: ${btcBalance.toString()}`);
      console.log(`   Decimals: ${btcDecimals}`);
      console.log(`   Formatted: ${btcFormatted}`);
      
      // Проверяем, достаточно ли для продажи
      const minAmount = ethers.utils.parseUnits('0.001', btcDecimals); // Минимум 0.001 BTC
      if (btcBalance.gte(minAmount)) {
        console.log(`✅ Достаточно BTC для продажи (>= 0.001)`);
      } else {
        console.log(`❌ Недостаточно BTC для продажи (< 0.001)`);
      }
    } catch (error) {
      console.log(`❌ Ошибка BTC: ${error.message}`);
    }
    
    // ETH
    try {
      const ethBalance = await ethContract.balanceOf(userAddress);
      const ethDecimals = await ethContract.decimals();
      const ethSymbol = await ethContract.symbol();
      const ethName = await ethContract.name();
      const ethFormatted = ethers.utils.formatUnits(ethBalance, ethDecimals);
      
      console.log(`\n💰 ${ethName} (${ethSymbol}):`);
      console.log(`   Raw: ${ethBalance.toString()}`);
      console.log(`   Decimals: ${ethDecimals}`);
      console.log(`   Formatted: ${ethFormatted}`);
    } catch (error) {
      console.log(`❌ Ошибка ETH: ${error.message}`);
    }
    
    console.log('\n💡 ВОЗМОЖНЫЕ ПРИЧИНЫ РАСХОЖДЕНИЯ:');
    console.log('1. Разные decimals в токенах');
    console.log('2. Замороженные токены для ордеров');
    console.log('3. Ошибки в отображении');
    console.log('4. Проблемы с контрактом токена');
    
  } catch (error) {
    console.error('❌ Ошибка проверки балансов:', error.message);
  }
  
  console.log('\n✅ ПРОВЕРКА ЗАВЕРШЕНА');
  console.log('='.repeat(60));
}

checkDetailedBalances();
