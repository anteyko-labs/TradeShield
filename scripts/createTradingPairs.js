// СОЗДАНИЕ ТОРГОВЫХ ПАР В DEX КОНТРАКТЕ
const { ethers } = require('ethers');

async function createTradingPairs() {
  console.log('🔧 СОЗДАНИЕ ТОРГОВЫХ ПАР В DEX КОНТРАКТЕ');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Приватный ключ
    const privateKey = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Адреса
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    const ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
    
    // ABI для DEX
    const DEX_ABI = [
      "function createPair(address tokenA, address tokenB, uint256 initialAmountA, uint256 initialAmountB) external",
      "function owner() view returns (address)"
    ];
    
    // ABI для токенов
    const TOKEN_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)"
    ];
    
    const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
    const usdtContract = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, wallet);
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, wallet);
    const ethContract = new ethers.Contract(ETH_ADDRESS, TOKEN_ABI, wallet);
    
    console.log(`👤 Используем кошелек: ${wallet.address}`);
    
    // Проверяем, что мы владелец контракта
    const owner = await dexContract.owner();
    console.log(`👑 Владелец DEX: ${owner}`);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ ОШИБКА: Вы не владелец DEX контракта!');
      return;
    }
    
    // Проверяем балансы
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    const btcBalance = await btcContract.balanceOf(wallet.address);
    const ethBalance = await ethContract.balanceOf(wallet.address);
    
    console.log('\n📊 БАЛАНСЫ:');
    console.log(`💰 USDT: ${ethers.utils.formatUnits(usdtBalance, 6)}`);
    console.log(`💰 BTC: ${ethers.utils.formatUnits(btcBalance, 8)}`);
    console.log(`💰 ETH: ${ethers.utils.formatUnits(ethBalance, 18)}`);
    
    // Создаем пару USDT/BTC
    if (usdtBalance.gt(0) && btcBalance.gt(0)) {
      console.log('\n🔄 Создаем пару USDT/BTC...');
      
      // Одобряем трату токенов
      const usdtApproveTx = await usdtContract.approve(DEX_ADDRESS, usdtBalance);
      await usdtApproveTx.wait();
      console.log('✅ USDT одобрен');
      
      const btcApproveTx = await btcContract.approve(DEX_ADDRESS, btcBalance);
      await btcApproveTx.wait();
      console.log('✅ BTC одобрен');
      
      // Создаем пару
      const createPairTx = await dexContract.createPair(
        USDT_ADDRESS,
        BTC_ADDRESS,
        usdtBalance,
        btcBalance
      );
      
      await createPairTx.wait();
      console.log(`✅ Пара USDT/BTC создана! TX: ${createPairTx.hash}`);
    }
    
    // Создаем пару USDT/ETH
    if (usdtBalance.gt(0) && ethBalance.gt(0)) {
      console.log('\n🔄 Создаем пару USDT/ETH...');
      
      // Одобряем трату токенов
      const usdtApproveTx = await usdtContract.approve(DEX_ADDRESS, usdtBalance);
      await usdtApproveTx.wait();
      console.log('✅ USDT одобрен');
      
      const ethApproveTx = await ethContract.approve(DEX_ADDRESS, ethBalance);
      await ethApproveTx.wait();
      console.log('✅ ETH одобрен');
      
      // Создаем пару
      const createPairTx = await dexContract.createPair(
        USDT_ADDRESS,
        ETH_ADDRESS,
        usdtBalance,
        ethBalance
      );
      
      await createPairTx.wait();
      console.log(`✅ Пара USDT/ETH создана! TX: ${createPairTx.hash}`);
    }
    
    console.log('\n✅ ТОРГОВЫЕ ПАРЫ СОЗДАНЫ!');
    console.log('Теперь боты могут торговать, а пользователь может покупать/продавать!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ СКРИПТ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

createTradingPairs();
