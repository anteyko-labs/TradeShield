// СОЗДАНИЕ ТОРГОВЫХ ПАР
const { ethers } = require('ethers');

async function createTradingPairs() {
  console.log('📊 СОЗДАНИЕ ТОРГОВЫХ ПАР');
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
    "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)",
    "function owner() external view returns (address)"
  ];
  
  const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
  
  try {
    console.log('🔍 Проверяем владельца DEX...');
    const owner = await dexContract.owner();
    console.log('👑 Владелец DEX:', owner);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ Мы не владелец DEX!');
      return;
    }
    
    console.log('✅ Мы владелец DEX!');
    
    // Проверяем балансы пользователя
    console.log('\n💰 Проверяем балансы пользователя...');
    
    const usdtContract = new ethers.Contract(USDT_ADDRESS, [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)"
    ], wallet);
    
    const btcContract = new ethers.Contract(BTC_ADDRESS, [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)"
    ], wallet);
    
    const ethContract = new ethers.Contract(ETH_ADDRESS, [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)"
    ], wallet);
    
    const userAddress = wallet.address;
    
    const userUsdtBalance = await usdtContract.balanceOf(userAddress);
    const userBtcBalance = await btcContract.balanceOf(userAddress);
    const userEthBalance = await ethContract.balanceOf(userAddress);
    
    console.log('💵 USDT у пользователя:', ethers.utils.formatUnits(userUsdtBalance, 6));
    console.log('₿ BTC у пользователя:', ethers.utils.formatUnits(userBtcBalance, 8));
    console.log('Ξ ETH у пользователя:', ethers.utils.formatUnits(userEthBalance, 18));
    
    // Создаем пару USDT/BTC
    console.log('\n📊 Создаем пару USDT/BTC...');
    
    const initialUSDT = ethers.utils.parseUnits('1000', 6); // 1000 USDT
    const initialBTC = ethers.utils.parseUnits('0.01', 8);  // 0.01 BTC
    
    console.log('💵 Начальная USDT:', ethers.utils.formatUnits(initialUSDT, 6));
    console.log('₿ Начальная BTC:', ethers.utils.formatUnits(initialBTC, 8));
    
    // Проверяем, достаточно ли токенов
    if (userUsdtBalance.lt(initialUSDT)) {
      console.log('❌ Недостаточно USDT для создания пары!');
      return;
    }
    
    if (userBtcBalance.lt(initialBTC)) {
      console.log('❌ Недостаточно BTC для создания пары!');
      return;
    }
    
    // Одобряем токены для DEX
    console.log('🔐 Одобряем USDT для DEX...');
    const approveUsdtTx = await usdtContract.approve(DEX_ADDRESS, initialUSDT);
    await approveUsdtTx.wait();
    console.log('✅ USDT одобрен!');
    
    console.log('🔐 Одобряем BTC для DEX...');
    const approveBtcTx = await btcContract.approve(DEX_ADDRESS, initialBTC);
    await approveBtcTx.wait();
    console.log('✅ BTC одобрен!');
    
    // Создаем пару
    console.log('📊 Создаем пару USDT/BTC...');
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
    
    // Проверяем резервы
    console.log('\n🔍 Проверяем резервы USDT/BTC...');
    const reserves = await dexContract.getReserves(USDT_ADDRESS, BTC_ADDRESS);
    console.log('💵 USDT резерв:', ethers.utils.formatUnits(reserves[0], 6));
    console.log('₿ BTC резерв:', ethers.utils.formatUnits(reserves[1], 8));
    
    console.log('\n🎯 ПАРА СОЗДАНА!');
    console.log('✅ USDT/BTC пара активна');
    console.log('✅ Ликвидность добавлена');
    console.log('✅ Можно тестировать торговлю!');
    
  } catch (error) {
    console.error('❌ Ошибка создания пары:', error.message);
    
    if (error.message.includes('execution reverted')) {
      console.log('\n💡 ВОЗМОЖНЫЕ ПРИЧИНЫ:');
      console.log('1. Недостаточно токенов');
      console.log('2. Токены не одобрены');
      console.log('3. Пара уже существует');
      console.log('4. Проблема с контрактом');
    }
  }
}

createTradingPairs();