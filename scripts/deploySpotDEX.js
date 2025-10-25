// ДЕПЛОЙ СПОТОВОЙ БИРЖИ
const { ethers } = require('ethers');

async function deploySpotDEX() {
  console.log('🚀 ДЕПЛОЙ СПОТОВОЙ БИРЖИ');
  console.log('='.repeat(50));
  
  // Подключение к Sepolia
  const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
  
  // ВАЖНО: Замените на ваш приватный ключ!
  const privateKey = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('📡 Подключение к Sepolia...');
  console.log('👤 Адрес:', wallet.address);
  
  // ABI для SpotDEX
  const SpotDEX_ABI = [
    "constructor()",
    "function createPair(address tokenA, address tokenB, uint256 initialAmountA, uint256 initialAmountB) external",
    "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external",
    "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)",
    "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)",
    "function getTokenBalance(address token) external view returns (uint256)",
    "function owner() external view returns (address)"
  ];
  
  // Читаем bytecode из файла
  const fs = require('fs');
  const path = require('path');
  const bytecodePath = path.join(__dirname, '../build/SpotDEX.bin.txt');
  const SpotDEX_Bytecode = fs.readFileSync(bytecodePath, 'utf8').trim();
  
  try {
    console.log('📦 Деплой SpotDEX контракта...');
    const factory = new ethers.ContractFactory(SpotDEX_ABI, SpotDEX_Bytecode, wallet);
    const contract = await factory.deploy();
    await contract.deployed();
    
    console.log('✅ SpotDEX развернут!');
    console.log('📍 Адрес контракта:', contract.address);
    console.log('🔗 TX Hash:', contract.deployTransaction.hash);
    
    // Проверяем владельца
    const owner = await contract.owner();
    console.log('👑 Владелец:', owner);
    
    console.log('\n🎯 СЛЕДУЮЩИЕ ШАГИ:');
    console.log('1. Обновить адрес в userTradingService.ts');
    console.log('2. Создать торговые пары');
    console.log('3. Добавить ликвидность');
    console.log('4. Протестировать торговлю');
    
  } catch (error) {
    console.error('❌ Ошибка деплоя:', error.message);
  }
}

deploySpotDEX();
