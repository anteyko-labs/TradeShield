const { ethers } = require('ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC = 'https://sepolia.drpc.org';

// Адреса контрактов
const CONTRACT_ADDRESSES = {
  DEX: '0xCcA67eB690872566C1260F4777BfE7C79ff4047d',
  BTC_TOKEN: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  USDT_TOKEN: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6'
};

// ABI для DEX
const DEX_ABI = [
  "function swap(address,address,uint256,uint256) returns (uint256)"
];

// ABI для токенов
const TOKEN_ABI = [
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)"
];

async function testSimpleTrade() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  try {
    console.log('🚀 Testing Simple Trade...\n');
    
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const userAddress = await wallet.getAddress();
    
    console.log(`👤 User Address: ${userAddress}\n`);

    // Инициализируем контракты
    const dex = new ethers.Contract(CONTRACT_ADDRESSES.DEX, DEX_ABI, wallet);
    const usdtToken = new ethers.Contract(CONTRACT_ADDRESSES.USDT_TOKEN, TOKEN_ABI, wallet);
    const btcToken = new ethers.Contract(CONTRACT_ADDRESSES.BTC_TOKEN, TOKEN_ABI, wallet);

    // Проверяем балансы
    console.log('💰 Checking Balances:');
    const usdtBalance = await usdtToken.balanceOf(userAddress);
    const btcBalance = await btcToken.balanceOf(userAddress);
    
    console.log(`   USDT: ${ethers.utils.formatUnits(usdtBalance, 6)}`);
    console.log(`   BTC:  ${ethers.utils.formatUnits(btcBalance, 8)}\n`);

    if (usdtBalance.lt(ethers.utils.parseUnits('100', 6))) {
      console.log('❌ Insufficient USDT balance for trading');
      return;
    }

    // Тестируем очень маленькую торговлю
    console.log('🔄 Testing small trade (1 USDT for BTC)...');
    
    try {
      // Одобряем 1 USDT для DEX
      const approveAmount = ethers.utils.parseUnits('1', 6); // 1 USDT
      const approveTx = await usdtToken.approve(CONTRACT_ADDRESSES.DEX, approveAmount);
      console.log(`   ✅ USDT approved. Tx: ${approveTx.hash}`);
      await approveTx.wait();
      
      // Выполняем очень маленький свап
      const swapAmount = ethers.utils.parseUnits('1', 6); // 1 USDT
      const minAmountOut = ethers.utils.parseUnits('0.000001', 8); // Минимум 0.000001 BTC
      
      console.log('   Attempting swap...');
      const swapTx = await dex.swap(
        CONTRACT_ADDRESSES.USDT_TOKEN,
        CONTRACT_ADDRESSES.BTC_TOKEN,
        swapAmount,
        minAmountOut
      );
      
      console.log(`   ✅ Swap executed! Tx: ${swapTx.hash}`);
      const receipt = await swapTx.wait();
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
      // Проверяем новые балансы
      const newUsdtBalance = await usdtToken.balanceOf(userAddress);
      const newBtcBalance = await btcToken.balanceOf(userAddress);
      
      console.log(`   New USDT Balance: ${ethers.utils.formatUnits(newUsdtBalance, 6)}`);
      console.log(`   New BTC Balance: ${ethers.utils.formatUnits(newBtcBalance, 8)}`);
      
      const usdtSpent = parseFloat(ethers.utils.formatUnits(usdtBalance.sub(newUsdtBalance), 6));
      const btcReceived = parseFloat(ethers.utils.formatUnits(newBtcBalance.sub(btcBalance), 8));
      
      console.log(`   USDT Spent: ${usdtSpent}`);
      console.log(`   BTC Received: ${btcReceived}`);
      console.log(`   Effective Price: ${usdtSpent / btcReceived} USDT per BTC`);
      
    } catch (error) {
      console.log(`   ❌ Trade failed: ${error.message}`);
      
      // Если ошибка в арифметике, попробуем еще меньшую сумму
      if (error.message.includes('arithmetic')) {
        console.log('   🔄 Trying even smaller amount (0.1 USDT)...');
        
        try {
          const tinyAmount = ethers.utils.parseUnits('0.1', 6); // 0.1 USDT
          const tinyMinOut = ethers.utils.parseUnits('0.0000001', 8); // 0.0000001 BTC
          
          const approveTx2 = await usdtToken.approve(CONTRACT_ADDRESSES.DEX, tinyAmount);
          await approveTx2.wait();
          
          const swapTx2 = await dex.swap(
            CONTRACT_ADDRESSES.USDT_TOKEN,
            CONTRACT_ADDRESSES.BTC_TOKEN,
            tinyAmount,
            tinyMinOut
          );
          
          console.log(`   ✅ Tiny swap executed! Tx: ${swapTx2.hash}`);
          await swapTx2.wait();
          
        } catch (tinyError) {
          console.log(`   ❌ Even tiny trade failed: ${tinyError.message}`);
        }
      }
    }

    console.log('\n✅ Simple Trade Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleTrade();
