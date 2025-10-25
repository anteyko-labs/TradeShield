const { ethers } = require('ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC = 'https://sepolia.drpc.org';

// Адреса контрактов
const CONTRACT_ADDRESSES = {
  DEX: '0xCcA67eB690872566C1260F4777BfE7C79ff4047d',
  BTC_TOKEN: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH_TOKEN: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb',
  USDT_TOKEN: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6'
};

// ABI для DEX
const DEX_ABI = [
  "function createPair(address,address,uint256,uint256) external",
  "function getPairInfo(address,address) view returns (tuple(address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, uint256 totalLiquidity, bool isActive, uint256 lastPrice, uint256 priceUpdateTime))"
];

// ABI для токенов
const TOKEN_ABI = [
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)"
];

async function createTradingPairs() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  try {
    console.log('🚀 Creating Trading Pairs...\n');
    
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const userAddress = await wallet.getAddress();
    
    console.log(`👤 User Address: ${userAddress}\n`);

    // Инициализируем контракты
    const dex = new ethers.Contract(CONTRACT_ADDRESSES.DEX, DEX_ABI, wallet);
    const usdtToken = new ethers.Contract(CONTRACT_ADDRESSES.USDT_TOKEN, TOKEN_ABI, wallet);
    const btcToken = new ethers.Contract(CONTRACT_ADDRESSES.BTC_TOKEN, TOKEN_ABI, wallet);
    const ethToken = new ethers.Contract(CONTRACT_ADDRESSES.ETH_TOKEN, TOKEN_ABI, wallet);

    // Проверяем текущие пары
    console.log('📊 Checking existing pairs...');
    
    try {
      const btcUsdtPair = await dex.getPairInfo(CONTRACT_ADDRESSES.BTC_TOKEN, CONTRACT_ADDRESSES.USDT_TOKEN);
      console.log(`   BTC/USDT: Already exists (Active: ${btcUsdtPair.isActive})`);
    } catch (error) {
      console.log(`   BTC/USDT: Not found - will create`);
    }

    try {
      const ethUsdtPair = await dex.getPairInfo(CONTRACT_ADDRESSES.ETH_TOKEN, CONTRACT_ADDRESSES.USDT_TOKEN);
      console.log(`   ETH/USDT: Already exists (Active: ${ethUsdtPair.isActive})`);
    } catch (error) {
      console.log(`   ETH/USDT: Not found - will create`);
    }

    // Создаем BTC/USDT пару
    console.log('\n🔄 Creating BTC/USDT pair...');
    try {
      // Добавляем ликвидность: 1 BTC + 100,000 USDT
      const btcAmount = ethers.utils.parseUnits('1', 8); // 1 BTC
      const usdtAmount = ethers.utils.parseUnits('100000', 6); // 100,000 USDT
      
      // Одобряем токены для DEX
      console.log('   Approving BTC...');
      const btcApproveTx = await btcToken.approve(CONTRACT_ADDRESSES.DEX, btcAmount);
      await btcApproveTx.wait();
      
      console.log('   Approving USDT...');
      const usdtApproveTx = await usdtToken.approve(CONTRACT_ADDRESSES.DEX, usdtAmount);
      await usdtApproveTx.wait();
      
      // Создаем пару
      console.log('   Creating BTC/USDT pair...');
      const createPairTx = await dex.createPair(
        CONTRACT_ADDRESSES.BTC_TOKEN,
        CONTRACT_ADDRESSES.USDT_TOKEN,
        btcAmount,
        usdtAmount
      );
      
      console.log(`   ✅ BTC/USDT pair created! Tx: ${createPairTx.hash}`);
      await createPairTx.wait();
      
      // Проверяем созданную пару
      const btcUsdtPair = await dex.getPairInfo(CONTRACT_ADDRESSES.BTC_TOKEN, CONTRACT_ADDRESSES.USDT_TOKEN);
      console.log(`   Pair Info:`);
      console.log(`     Active: ${btcUsdtPair.isActive}`);
      console.log(`     Reserve BTC: ${ethers.utils.formatUnits(btcUsdtPair.reserveA, 8)}`);
      console.log(`     Reserve USDT: ${ethers.utils.formatUnits(btcUsdtPair.reserveB, 6)}`);
      console.log(`     Price: ${ethers.utils.formatUnits(btcUsdtPair.lastPrice, 6)} USDT per BTC`);
      
    } catch (error) {
      console.log(`   ❌ BTC/USDT pair creation failed: ${error.message}`);
    }

    // Создаем ETH/USDT пару
    console.log('\n🔄 Creating ETH/USDT pair...');
    try {
      // Добавляем ликвидность: 10 ETH + 30,000 USDT
      const ethAmount = ethers.utils.parseUnits('10', 18); // 10 ETH
      const usdtAmount = ethers.utils.parseUnits('30000', 6); // 30,000 USDT
      
      // Одобряем токены для DEX
      console.log('   Approving ETH...');
      const ethApproveTx = await ethToken.approve(CONTRACT_ADDRESSES.DEX, ethAmount);
      await ethApproveTx.wait();
      
      console.log('   Approving USDT...');
      const usdtApproveTx = await usdtToken.approve(CONTRACT_ADDRESSES.DEX, usdtAmount);
      await usdtApproveTx.wait();
      
      // Создаем пару
      console.log('   Creating ETH/USDT pair...');
      const createPairTx = await dex.createPair(
        CONTRACT_ADDRESSES.ETH_TOKEN,
        CONTRACT_ADDRESSES.USDT_TOKEN,
        ethAmount,
        usdtAmount
      );
      
      console.log(`   ✅ ETH/USDT pair created! Tx: ${createPairTx.hash}`);
      await createPairTx.wait();
      
      // Проверяем созданную пару
      const ethUsdtPair = await dex.getPairInfo(CONTRACT_ADDRESSES.ETH_TOKEN, CONTRACT_ADDRESSES.USDT_TOKEN);
      console.log(`   Pair Info:`);
      console.log(`     Active: ${ethUsdtPair.isActive}`);
      console.log(`     Reserve ETH: ${ethers.utils.formatUnits(ethUsdtPair.reserveA, 18)}`);
      console.log(`     Reserve USDT: ${ethers.utils.formatUnits(ethUsdtPair.reserveB, 6)}`);
      console.log(`     Price: ${ethers.utils.formatUnits(ethUsdtPair.lastPrice, 6)} USDT per ETH`);
      
    } catch (error) {
      console.log(`   ❌ ETH/USDT pair creation failed: ${error.message}`);
    }

    console.log('\n✅ Trading Pairs Creation Complete!');
    console.log('🎉 Now you can test trading on the frontend!');

  } catch (error) {
    console.error('❌ Pair creation failed:', error);
  }
}

createTradingPairs();
