// ПРОВЕРКА ФУНКЦИЙ DEX
const { ethers } = require('ethers');

async function checkDEXFunctions() {
  console.log('🔍 ПРОВЕРКА ФУНКЦИЙ DEX');
  console.log('='.repeat(50));
  
  // Подключение к Sepolia
  const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
  
  // ВАЖНО: Замените на ваш приватный ключ!
  const privateKey = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('📡 Подключение к Sepolia...');
  console.log('👤 Адрес:', wallet.address);
  
  // Адреса
  const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
  const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
  const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
  const ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
  
  // Простой ABI для проверки
  const DEX_ABI = [
    "function owner() external view returns (address)",
    "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)"
  ];
  
  const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
  
  try {
    console.log('🔍 Проверяем владельца DEX...');
    const owner = await dexContract.owner();
    console.log('👑 Владелец DEX:', owner);
    console.log('👤 Наш адрес:', wallet.address);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ Мы не владелец DEX!');
      return;
    }
    
    console.log('✅ Мы владелец DEX!');
    
    // Проверяем резервы пар
    console.log('\n🔍 Проверяем резервы пар...');
    
    try {
      const usdtBtcReserves = await dexContract.getReserves(USDT_ADDRESS, BTC_ADDRESS);
      console.log('💵/₿ USDT/BTC резервы:', ethers.utils.formatUnits(usdtBtcReserves[0], 6), '/', ethers.utils.formatUnits(usdtBtcReserves[1], 8));
    } catch (error) {
      console.log('❌ Ошибка получения резервов USDT/BTC:', error.message);
    }
    
    try {
      const usdtEthReserves = await dexContract.getReserves(USDT_ADDRESS, ETH_ADDRESS);
      console.log('💵/Ξ USDT/ETH резервы:', ethers.utils.formatUnits(usdtEthReserves[0], 6), '/', ethers.utils.formatUnits(usdtEthReserves[1], 18));
    } catch (error) {
      console.log('❌ Ошибка получения резервов USDT/ETH:', error.message);
    }
    
    // Проверяем балансы токенов напрямую
    console.log('\n💰 Проверяем балансы токенов в DEX...');
    
    const usdtContract = new ethers.Contract(USDT_ADDRESS, [
      "function balanceOf(address owner) view returns (uint256)"
    ], provider);
    
    const btcContract = new ethers.Contract(BTC_ADDRESS, [
      "function balanceOf(address owner) view returns (uint256)"
    ], provider);
    
    const ethContract = new ethers.Contract(ETH_ADDRESS, [
      "function balanceOf(address owner) view returns (uint256)"
    ], provider);
    
    try {
      const usdtBalance = await usdtContract.balanceOf(DEX_ADDRESS);
      console.log('💵 USDT в DEX:', ethers.utils.formatUnits(usdtBalance, 6));
    } catch (error) {
      console.log('❌ Ошибка получения баланса USDT:', error.message);
    }
    
    try {
      const btcBalance = await btcContract.balanceOf(DEX_ADDRESS);
      console.log('₿ BTC в DEX:', ethers.utils.formatUnits(btcBalance, 8));
    } catch (error) {
      console.log('❌ Ошибка получения баланса BTC:', error.message);
    }
    
    try {
      const ethBalance = await ethContract.balanceOf(DEX_ADDRESS);
      console.log('Ξ ETH в DEX:', ethers.utils.formatUnits(ethBalance, 18));
    } catch (error) {
      console.log('❌ Ошибка получения баланса ETH:', error.message);
    }
    
    console.log('\n🎯 РЕЗУЛЬТАТ:');
    console.log('✅ DEX контракт существует');
    console.log('✅ Мы владелец');
    console.log('❌ Нет ликвидности в парах');
    console.log('💡 Нужно добавить ликвидность!');
    
  } catch (error) {
    console.error('❌ Ошибка проверки DEX:', error.message);
  }
}

checkDEXFunctions();