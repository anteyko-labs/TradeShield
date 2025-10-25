// ДОБАВЛЕНИЕ ЛИКВИДНОСТИ В DEX КОНТРАКТ
const { ethers } = require('ethers');

async function addLiquidity() {
  console.log('🔧 ДОБАВЛЕНИЕ ЛИКВИДНОСТИ В DEX');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Приватный ключ владельца контракта (нужно заменить на реальный)
    const ownerPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // ЗАМЕНИТЬ НА РЕАЛЬНЫЙ!
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
    
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
    
    console.log('\n📊 ПРОВЕРКА:');
    
    // Проверяем балансы владельца
    const usdtContract = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, ownerWallet);
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, ownerWallet);
    
    const usdtBalance = await usdtContract.balanceOf(ownerWallet.address);
    const btcBalance = await btcContract.balanceOf(ownerWallet.address);
    
    console.log(`💰 USDT у владельца: ${ethers.utils.formatUnits(usdtBalance, 6)}`);
    console.log(`💰 BTC у владельца: ${ethers.utils.formatUnits(btcBalance, 18)}`);
    
    if (usdtBalance.gt(0) && btcBalance.gt(0)) {
      console.log('✅ У владельца есть токены!');
      
      // Создаем контракт DEX
      const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, ownerWallet);
      
      // Добавляем ликвидность
      const usdtAmount = ethers.utils.parseUnits('10000', 6); // 10,000 USDT
      const btcAmount = ethers.utils.parseUnits('0.1', 18);   // 0.1 BTC
      
      console.log('\n🔄 ДОБАВЛЕНИЕ ЛИКВИДНОСТИ:');
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
      console.log(`📊 Резервы: ${ethers.utils.formatUnits(reserveA, 6)} USDT, ${ethers.utils.formatUnits(reserveB, 18)} BTC`);
      
    } else {
      console.log('❌ У владельца нет токенов!');
      console.log('💡 Нужно сначала дать токены владельцу контракта');
    }
    
  } catch (error) {
    console.error('❌ Ошибка добавления ликвидности:', error.message);
  }
  
  console.log('\n✅ ТЕСТ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

addLiquidity();
