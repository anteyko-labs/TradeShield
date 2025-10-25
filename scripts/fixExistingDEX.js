// ИСПРАВЛЕНИЕ СУЩЕСТВУЮЩЕГО DEX
const { ethers } = require('ethers');

async function fixExistingDEX() {
  console.log('🔧 ИСПРАВЛЕНИЕ СУЩЕСТВУЮЩЕГО DEX');
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
  
  // ABI для DEX
  const DEX_ABI = [
    "function createPair(address tokenA, address tokenB, uint256 initialAmountA, uint256 initialAmountB) external",
    "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external",
    "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)",
    "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)",
    "function getTokenBalance(address token) external view returns (uint256)",
    "function owner() external view returns (address)"
  ];
  
  const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
  
  try {
    console.log('🔍 Проверяем владельца DEX...');
    const owner = await dexContract.owner();
    console.log('👑 Владелец DEX:', owner);
    console.log('👤 Наш адрес:', wallet.address);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ Мы не владелец DEX! Нужны права владельца для создания пар.');
      return;
    }
    
    console.log('✅ Мы владелец DEX! Можем создавать пары.');
    
    // Проверяем балансы токенов
    console.log('\n💰 Проверяем балансы токенов...');
    const usdtBalance = await dexContract.getTokenBalance(USDT_ADDRESS);
    const btcBalance = await dexContract.getTokenBalance(BTC_ADDRESS);
    const ethBalance = await dexContract.getTokenBalance(ETH_ADDRESS);
    
    console.log('💵 USDT в DEX:', ethers.utils.formatUnits(usdtBalance, 6));
    console.log('₿ BTC в DEX:', ethers.utils.formatUnits(btcBalance, 8));
    console.log('Ξ ETH в DEX:', ethers.utils.formatUnits(ethBalance, 18));
    
    // Проверяем существующие пары
    console.log('\n🔍 Проверяем существующие пары...');
    const usdtBtcReserves = await dexContract.getReserves(USDT_ADDRESS, BTC_ADDRESS);
    const usdtEthReserves = await dexContract.getReserves(USDT_ADDRESS, ETH_ADDRESS);
    
    console.log('💵/₿ USDT/BTC резервы:', ethers.utils.formatUnits(usdtBtcReserves[0], 6), '/', ethers.utils.formatUnits(usdtBtcReserves[1], 8));
    console.log('💵/Ξ USDT/ETH резервы:', ethers.utils.formatUnits(usdtEthReserves[0], 6), '/', ethers.utils.formatUnits(usdtEthReserves[1], 18));
    
    if (usdtBtcReserves[0].eq(0) && usdtBtcReserves[1].eq(0)) {
      console.log('\n📊 Создаем пару USDT/BTC...');
      
      // Создаем пару с небольшими суммами
      const initialUSDT = ethers.utils.parseUnits('1000', 6); // 1000 USDT
      const initialBTC = ethers.utils.parseUnits('0.01', 8);    // 0.01 BTC
      
      console.log('💵 Начальная USDT:', ethers.utils.formatUnits(initialUSDT, 6));
      console.log('₿ Начальная BTC:', ethers.utils.formatUnits(initialBTC, 8));
      
      const createPairTx = await dexContract.createPair(
        USDT_ADDRESS,
        BTC_ADDRESS,
        initialUSDT,
        initialBTC
      );
      
      console.log('⏳ Ожидаем подтверждения...');
      await createPairTx.wait();
      
      console.log('✅ Пара USDT/BTC создана!');
      console.log('🔗 TX Hash:', createPairTx.hash);
    } else {
      console.log('✅ Пара USDT/BTC уже существует!');
    }
    
    if (usdtEthReserves[0].eq(0) && usdtEthReserves[1].eq(0)) {
      console.log('\n📊 Создаем пару USDT/ETH...');
      
      // Создаем пару с небольшими суммами
      const initialUSDT = ethers.utils.parseUnits('1000', 6); // 1000 USDT
      const initialETH = ethers.utils.parseUnits('0.3', 18);  // 0.3 ETH
      
      console.log('💵 Начальная USDT:', ethers.utils.formatUnits(initialUSDT, 6));
      console.log('Ξ Начальная ETH:', ethers.utils.formatUnits(initialETH, 18));
      
      const createPairTx = await dexContract.createPair(
        USDT_ADDRESS,
        ETH_ADDRESS,
        initialUSDT,
        initialETH
      );
      
      console.log('⏳ Ожидаем подтверждения...');
      await createPairTx.wait();
      
      console.log('✅ Пара USDT/ETH создана!');
      console.log('🔗 TX Hash:', createPairTx.hash);
    } else {
      console.log('✅ Пара USDT/ETH уже существует!');
    }
    
    console.log('\n🎯 DEX ИСПРАВЛЕН!');
    console.log('✅ Торговые пары созданы');
    console.log('✅ Ликвидность добавлена');
    console.log('✅ Можно тестировать торговлю!');
    
  } catch (error) {
    console.error('❌ Ошибка исправления DEX:', error.message);
    
    if (error.message.includes('execution reverted')) {
      console.log('\n💡 ВОЗМОЖНЫЕ ПРИЧИНЫ:');
      console.log('1. Недостаточно токенов для создания пар');
      console.log('2. Токены не одобрены для DEX');
      console.log('3. Проблема с контрактом DEX');
    }
  }
}

fixExistingDEX();