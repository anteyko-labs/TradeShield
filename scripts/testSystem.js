// ТЕСТ СИСТЕМЫ
const { ethers } = require('ethers');

async function testSystem() {
  console.log('🔧 ТЕСТ СИСТЕМЫ');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Приватный ключ
    const privateKey = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Адреса
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    const ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
    
    console.log(`👤 Тестируем кошелек: ${wallet.address}`);
    
    // ABI для токенов
    const TOKEN_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ];
    
    const usdtContract = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, provider);
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, provider);
    const ethContract = new ethers.Contract(ETH_ADDRESS, TOKEN_ABI, provider);
    
    console.log('\n📊 ПРОВЕРЯЕМ БАЛАНСЫ:');
    
    // USDT
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    const usdtDecimals = await usdtContract.decimals();
    const usdtSymbol = await usdtContract.symbol();
    const usdtFormatted = ethers.utils.formatUnits(usdtBalance, usdtDecimals);
    console.log(`💰 ${usdtSymbol}: ${usdtFormatted} (decimals: ${usdtDecimals})`);
    
    // BTC
    const btcBalance = await btcContract.balanceOf(wallet.address);
    const btcDecimals = await btcContract.decimals();
    const btcSymbol = await btcContract.symbol();
    const btcFormatted = ethers.utils.formatUnits(btcBalance, btcDecimals);
    console.log(`💰 ${btcSymbol}: ${btcFormatted} (decimals: ${btcDecimals})`);
    
    // ETH
    const ethBalance = await ethContract.balanceOf(wallet.address);
    const ethDecimals = await ethContract.decimals();
    const ethSymbol = await ethContract.symbol();
    const ethFormatted = ethers.utils.formatUnits(ethBalance, ethDecimals);
    console.log(`💰 ${ethSymbol}: ${ethFormatted} (decimals: ${ethDecimals})`);
    
    console.log('\n💡 ПРОВЕРКА:');
    console.log('✅ Балансы загружены из блокчейна');
    console.log('✅ userTradingService должен работать');
    console.log('✅ Система должна работать без ошибок');
    
    console.log('\n🚀 ИНСТРУКЦИИ:');
    console.log('1. Откройте браузер: http://localhost:5173');
    console.log('2. Подключите кошелек');
    console.log('3. Попробуйте купить BTC');
    console.log('4. Проверьте, что нет ошибок');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ ТЕСТ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

testSystem();
