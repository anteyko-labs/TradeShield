// ДОБАВЛЕНИЕ ЛИКВИДНОСТИ В DEX КОНТРАКТ
const { ethers } = require('ethers');

async function addLiquidityToDEX() {
  console.log('🔧 ДОБАВЛЕНИЕ ЛИКВИДНОСТИ В DEX КОНТРАКТ');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // ВАЖНО: Замените на ваш приватный ключ!
    const privateKey = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba'; // ЗАМЕНИТЕ НА РЕАЛЬНЫЙ!
    
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
    
    // Адреса
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    const ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
    
    // ABI для DEX
    const DEX_ABI = [
      "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
      "function getReserves(address tokenA, address tokenB) view returns (uint256 reserveA, uint256 reserveB)"
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
    
    // Проверяем балансы
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    const btcBalance = await btcContract.balanceOf(wallet.address);
    const ethBalance = await ethContract.balanceOf(wallet.address);
    
    console.log('\n📊 БАЛАНСЫ:');
    console.log(`💰 USDT: ${ethers.utils.formatUnits(usdtBalance, 6)}`);
    console.log(`💰 BTC: ${ethers.utils.formatUnits(btcBalance, 8)}`);
    console.log(`💰 ETH: ${ethers.utils.formatUnits(ethBalance, 18)}`);
    
    // Добавляем ликвидность USDT/BTC
    if (usdtBalance.gt(0) && btcBalance.gt(0)) {
      console.log('\n🔄 Добавляем ликвидность USDT/BTC...');
      
      // Одобряем трату токенов
      const usdtApproveTx = await usdtContract.approve(DEX_ADDRESS, usdtBalance);
      await usdtApproveTx.wait();
      
      const btcApproveTx = await btcContract.approve(DEX_ADDRESS, btcBalance);
      await btcApproveTx.wait();
      
      // Добавляем ликвидность
      const addLiquidityTx = await dexContract.addLiquidity(
        USDT_ADDRESS,
        BTC_ADDRESS,
        usdtBalance,
        btcBalance
      );
      
      await addLiquidityTx.wait();
      console.log(`✅ Ликвидность USDT/BTC добавлена! TX: ${addLiquidityTx.hash}`);
    }
    
    // Добавляем ликвидность USDT/ETH
    if (usdtBalance.gt(0) && ethBalance.gt(0)) {
      console.log('\n🔄 Добавляем ликвидность USDT/ETH...');
      
      // Одобряем трату токенов
      const usdtApproveTx = await usdtContract.approve(DEX_ADDRESS, usdtBalance);
      await usdtApproveTx.wait();
      
      const ethApproveTx = await ethContract.approve(DEX_ADDRESS, ethBalance);
      await ethApproveTx.wait();
      
      // Добавляем ликвидность
      const addLiquidityTx = await dexContract.addLiquidity(
        USDT_ADDRESS,
        ETH_ADDRESS,
        usdtBalance,
        ethBalance
      );
      
      await addLiquidityTx.wait();
      console.log(`✅ Ликвидность USDT/ETH добавлена! TX: ${addLiquidityTx.hash}`);
    }
    
    console.log('\n✅ ЛИКВИДНОСТЬ ДОБАВЛЕНА!');
    console.log('Теперь боты могут торговать, а пользователь может покупать/продавать!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ СКРИПТ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

addLiquidityToDEX();