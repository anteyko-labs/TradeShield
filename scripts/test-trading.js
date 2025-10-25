const { ethers } = require('ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC = 'https://sepolia.drpc.org';

// Адреса контрактов
const CONTRACT_ADDRESSES = {
  TOKEN_REGISTRY: '0x0557CF561B428bCf9cDD8b49044E330Ae8BBDa34',
  DEX: '0xCcA67eB690872566C1260F4777BfE7C79ff4047d',
  WALLET: '0x72bfaa294E6443E944ECBdad428224cC050C658E',
  BTC_TOKEN: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH_TOKEN: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb',
  USDT_TOKEN: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6'
};

// ABI для токенов
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// ABI для DEX
const DEX_ABI = [
  "function swap(address,address,uint256,uint256) returns (uint256)",
  "function getPairInfo(address,address) view returns (tuple(address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, uint256 totalLiquidity, bool isActive, uint256 lastPrice, uint256 priceUpdateTime))",
  "function getUserTrades(address) view returns (uint256[])",
  "function getTrade(uint256) view returns (tuple(address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 price, uint256 timestamp, bytes32 txHash))"
];

// ABI для Wallet
const WALLET_ABI = [
  "function getBalance(address,address) view returns (uint256)",
  "function getAllBalances(address) view returns (address[], uint256[])",
  "function getPositions(address) view returns (tuple(address token, uint256 amount, uint256 entryPrice, uint256 timestamp, bool isLong)[])"
];

async function testTrading() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  try {
    console.log('🚀 Testing Trading System...\n');
    
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const userAddress = await wallet.getAddress();
    
    console.log(`👤 User Address: ${userAddress}`);
    console.log(`🔗 Network: Sepolia Testnet`);
    console.log(`🌐 RPC: ${SEPOLIA_RPC}\n`);

    // Инициализируем контракты
    const usdtToken = new ethers.Contract(CONTRACT_ADDRESSES.USDT_TOKEN, TOKEN_ABI, wallet);
    const btcToken = new ethers.Contract(CONTRACT_ADDRESSES.BTC_TOKEN, TOKEN_ABI, wallet);
    const ethToken = new ethers.Contract(CONTRACT_ADDRESSES.ETH_TOKEN, TOKEN_ABI, wallet);
    const dex = new ethers.Contract(CONTRACT_ADDRESSES.DEX, DEX_ABI, wallet);
    const userWallet = new ethers.Contract(CONTRACT_ADDRESSES.WALLET, WALLET_ABI, wallet);

    console.log('📋 Contract Addresses:');
    console.log(`   USDT: ${CONTRACT_ADDRESSES.USDT_TOKEN}`);
    console.log(`   BTC:  ${CONTRACT_ADDRESSES.BTC_TOKEN}`);
    console.log(`   ETH:  ${CONTRACT_ADDRESSES.ETH_TOKEN}`);
    console.log(`   DEX:  ${CONTRACT_ADDRESSES.DEX}`);
    console.log(`   Wallet: ${CONTRACT_ADDRESSES.WALLET}\n`);

    // Проверяем балансы
    console.log('💰 Checking Balances:');
    
    const usdtBalance = await usdtToken.balanceOf(userAddress);
    const btcBalance = await btcToken.balanceOf(userAddress);
    const ethBalance = await ethToken.balanceOf(userAddress);
    
    console.log(`   USDT: ${ethers.utils.formatUnits(usdtBalance, 6)}`);
    console.log(`   BTC:  ${ethers.utils.formatUnits(btcBalance, 8)}`);
    console.log(`   ETH:  ${ethers.utils.formatUnits(ethBalance, 18)}\n`);

    // Проверяем информацию о парах
    console.log('📊 Checking Trading Pairs:');
    
    try {
      const btcUsdtPair = await dex.getPairInfo(CONTRACT_ADDRESSES.BTC_TOKEN, CONTRACT_ADDRESSES.USDT_TOKEN);
      console.log(`   BTC/USDT Pair:`);
      console.log(`     Active: ${btcUsdtPair.isActive}`);
      console.log(`     Reserve BTC: ${ethers.utils.formatUnits(btcUsdtPair.reserveA, 8)}`);
      console.log(`     Reserve USDT: ${ethers.utils.formatUnits(btcUsdtPair.reserveB, 6)}`);
      console.log(`     Last Price: ${ethers.utils.formatUnits(btcUsdtPair.lastPrice, 6)} USDT per BTC`);
    } catch (error) {
      console.log(`   BTC/USDT Pair: Not found or error: ${error.message}`);
    }

    try {
      const ethUsdtPair = await dex.getPairInfo(CONTRACT_ADDRESSES.ETH_TOKEN, CONTRACT_ADDRESSES.USDT_TOKEN);
      console.log(`   ETH/USDT Pair:`);
      console.log(`     Active: ${ethUsdtPair.isActive}`);
      console.log(`     Reserve ETH: ${ethers.utils.formatUnits(ethUsdtPair.reserveA, 18)}`);
      console.log(`     Reserve USDT: ${ethers.utils.formatUnits(ethUsdtPair.reserveB, 6)}`);
      console.log(`     Last Price: ${ethers.utils.formatUnits(ethUsdtPair.lastPrice, 6)} USDT per ETH`);
    } catch (error) {
      console.log(`   ETH/USDT Pair: Not found or error: ${error.message}`);
    }

    // Проверяем торговую историю
    console.log('\n📈 Checking Trade History:');
    try {
      const tradeIds = await dex.getUserTrades(userAddress);
      console.log(`   Total Trades: ${tradeIds.length}`);
      
      if (tradeIds.length > 0) {
        console.log('   Recent Trades:');
        for (let i = 0; i < Math.min(3, tradeIds.length); i++) {
          const trade = await dex.getTrade(tradeIds[i]);
          console.log(`     Trade ${i + 1}: ${ethers.utils.formatUnits(trade.amountIn, 6)} → ${ethers.utils.formatUnits(trade.amountOut, 8)}`);
        }
      }
    } catch (error) {
      console.log(`   Trade History: Error - ${error.message}`);
    }

    // Проверяем позиции в кошельке
    console.log('\n💼 Checking Wallet Positions:');
    try {
      const positions = await userWallet.getPositions(userAddress);
      console.log(`   Total Positions: ${positions.length}`);
      
      if (positions.length > 0) {
        for (let i = 0; i < positions.length; i++) {
          const pos = positions[i];
          console.log(`     Position ${i + 1}: ${ethers.utils.formatUnits(pos.amount, 8)} tokens at ${ethers.utils.formatUnits(pos.entryPrice, 6)} USDT`);
        }
      }
    } catch (error) {
      console.log(`   Wallet Positions: Error - ${error.message}`);
    }

    // Тестируем простую торговлю (если есть USDT)
    if (usdtBalance.gt(0)) {
      console.log('\n🔄 Testing Trade Execution:');
      console.log('   Attempting to buy 0.001 BTC with 100 USDT...');
      
      try {
        // Одобряем USDT для DEX
        const approveAmount = ethers.utils.parseUnits('100', 6);
        const approveTx = await usdtToken.approve(CONTRACT_ADDRESSES.DEX, approveAmount);
        console.log(`   ✅ USDT approved. Tx: ${approveTx.hash}`);
        await approveTx.wait();
        
        // Выполняем свап
        const swapAmount = ethers.utils.parseUnits('100', 6); // 100 USDT
        const minAmountOut = ethers.utils.parseUnits('0.0001', 8); // Минимум 0.0001 BTC
        
        const swapTx = await dex.swap(
          CONTRACT_ADDRESSES.USDT_TOKEN,
          CONTRACT_ADDRESSES.BTC_TOKEN,
          swapAmount,
          minAmountOut
        );
        
        console.log(`   ✅ Swap executed. Tx: ${swapTx.hash}`);
        const receipt = await swapTx.wait();
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
        
        // Проверяем новые балансы
        const newUsdtBalance = await usdtToken.balanceOf(userAddress);
        const newBtcBalance = await btcToken.balanceOf(userAddress);
        
        console.log(`   New USDT Balance: ${ethers.utils.formatUnits(newUsdtBalance, 6)}`);
        console.log(`   New BTC Balance: ${ethers.utils.formatUnits(newBtcBalance, 8)}`);
        
      } catch (error) {
        console.log(`   ❌ Trade failed: ${error.message}`);
      }
    } else {
      console.log('\n⚠️  No USDT balance found. Cannot test trading.');
    }

    console.log('\n✅ Trading System Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTrading();
