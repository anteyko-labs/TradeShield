// MINTING РЕАЛЬНЫХ ТОКЕНОВ ПОЛЬЗОВАТЕЛЮ
const { ethers } = require('ethers');

async function mintRealTokens() {
  console.log('🔧 MINTING РЕАЛЬНЫХ ТОКЕНОВ ПОЛЬЗОВАТЕЛЮ');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // ВАЖНО: Замените на ваш приватный ключ!
    const privateKey = 'YOUR_PRIVATE_KEY_HERE'; // ЗАМЕНИТЕ НА РЕАЛЬНЫЙ!
    
    if (privateKey === 'YOUR_PRIVATE_KEY_HERE') {
      console.log('❌ ОШИБКА: Замените privateKey на ваш реальный приватный ключ!');
      console.log('💡 Инструкции:');
      console.log('1. Откройте MetaMask');
      console.log('2. Нажмите на три точки → Account Details → Export Private Key');
      console.log('3. Скопируйте приватный ключ');
      console.log('4. Замените YOUR_PRIVATE_KEY_HERE на ваш ключ');
      return;
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Адреса токенов
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    const ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
    
    // ABI для токенов (нужна функция mint)
    const TOKEN_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function mint(address to, uint256 amount) external",
      "function symbol() view returns (string)"
    ];
    
    console.log(`👤 Используем кошелек: ${wallet.address}`);
    
    // Проверяем, есть ли функция mint
    const usdtContract = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, wallet);
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, wallet);
    const ethContract = new ethers.Contract(ETH_ADDRESS, TOKEN_ABI, wallet);
    
    console.log('\n📊 ПРОВЕРКА КОНТРАКТОВ:');
    
    try {
      // Проверяем USDT
      const usdtSymbol = await usdtContract.symbol();
      console.log(`✅ USDT контракт: ${usdtSymbol}`);
    } catch (error) {
      console.log(`❌ USDT контракт: ${error.message}`);
    }
    
    try {
      // Проверяем BTC
      const btcSymbol = await btcContract.symbol();
      console.log(`✅ BTC контракт: ${btcSymbol}`);
    } catch (error) {
      console.log(`❌ BTC контракт: ${error.message}`);
    }
    
    try {
      // Проверяем ETH
      const ethSymbol = await ethContract.symbol();
      console.log(`✅ ETH контракт: ${ethSymbol}`);
    } catch (error) {
      console.log(`❌ ETH контракт: ${error.message}`);
    }
    
    console.log('\n💡 РЕШЕНИЕ:');
    console.log('1. Если есть функция mint - можем дать токены');
    console.log('2. Если нет - нужно использовать другой подход');
    console.log('3. Или создать новый контракт с mint функцией');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ СКРИПТ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

mintRealTokens();
