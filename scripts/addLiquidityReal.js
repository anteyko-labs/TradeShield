// ДОБАВЛЕНИЕ РЕАЛЬНОЙ ЛИКВИДНОСТИ В DEX
const { ethers } = require('ethers');

async function addLiquidityReal() {
  console.log('🔧 ДОБАВЛЕНИЕ РЕАЛЬНОЙ ЛИКВИДНОСТИ В DEX');
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
    
    // Адреса
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    
    // ABI для DEX
    const DEX_ABI = [
      "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
      "function createPair(address tokenA, address tokenB) external",
      "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)"
    ];
    
    // ABI для токенов
    const TOKEN_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transfer(address to, uint256 amount) returns (bool)"
    ];
    
    console.log(`👤 Используем кошелек: ${wallet.address}`);
    
    // Проверяем балансы
    const usdtContract = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, wallet);
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, wallet);
    
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    const btcBalance = await btcContract.balanceOf(wallet.address);
    
    console.log(`💰 USDT баланс: ${ethers.utils.formatUnits(usdtBalance, 6)}`);
    console.log(`💰 BTC баланс: ${ethers.utils.formatUnits(btcBalance, 18)}`);
    
    if (usdtBalance.gt(0) && btcBalance.gt(0)) {
      console.log('✅ У вас есть токены для добавления ликвидности!');
      
      // Создаем контракт DEX
      const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
      
      // Добавляем ликвидность (используем 10% от баланса)
      const usdtAmount = usdtBalance.div(10); // 10% от баланса
      const btcAmount = btcBalance.div(10);   // 10% от баланса
      
      console.log(`\n🔄 Добавление ликвидности:`);
      console.log(`📈 USDT: ${ethers.utils.formatUnits(usdtAmount, 6)}`);
      console.log(`📈 BTC: ${ethers.utils.formatUnits(btcAmount, 18)}`);
      
      // Одобряем трату токенов
      console.log('⏳ Одобрение USDT...');
      const usdtApproveTx = await usdtContract.approve(DEX_ADDRESS, usdtAmount);
      await usdtApproveTx.wait();
      
      console.log('⏳ Одобрение BTC...');
      const btcApproveTx = await btcContract.approve(DEX_ADDRESS, btcAmount);
      await btcApproveTx.wait();
      
      // Добавляем ликвидность
      console.log('⏳ Добавление ликвидности...');
      const addLiquidityTx = await dexContract.addLiquidity(
        USDT_ADDRESS,
        BTC_ADDRESS,
        usdtAmount,
        btcAmount,
        { gasLimit: 500000 }
      );
      
      const receipt = await addLiquidityTx.wait();
      console.log(`✅ Ликвидность добавлена! TX: ${addLiquidityTx.hash}`);
      
      // Проверяем резервы
      const [reserveA, reserveB] = await dexContract.getReserves(USDT_ADDRESS, BTC_ADDRESS);
      console.log(`📊 Новые резервы: ${ethers.utils.formatUnits(reserveA, 6)} USDT, ${ethers.utils.formatUnits(reserveB, 18)} BTC`);
      
    } else {
      console.log('❌ У вас нет токенов для добавления ликвидности!');
      console.log('💡 Нужно сначала получить USDT и BTC токены');
    }
    
  } catch (error) {
    console.error('❌ Ошибка добавления ликвидности:', error.message);
  }
  
  console.log('\n✅ СКРИПТ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

addLiquidityReal();
