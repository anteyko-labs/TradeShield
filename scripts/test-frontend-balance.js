const { ethers } = require('ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC = 'https://sepolia.drpc.org';

// Адреса контрактов
const CONTRACT_ADDRESSES = {
  USDT_TOKEN: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC_TOKEN: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH_TOKEN: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// ABI для токенов
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function testFrontendBalance() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  try {
    console.log('🧪 Testing Frontend Balance Logic...\n');
    
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const userAddress = await wallet.getAddress();
    
    console.log(`👤 User Address: ${userAddress}\n`);

    // Инициализируем контракты
    const usdtToken = new ethers.Contract(CONTRACT_ADDRESSES.USDT_TOKEN, TOKEN_ABI, provider);
    const btcToken = new ethers.Contract(CONTRACT_ADDRESSES.BTC_TOKEN, TOKEN_ABI, provider);
    const ethToken = new ethers.Contract(CONTRACT_ADDRESSES.ETH_TOKEN, TOKEN_ABI, provider);

    // Симулируем логику фронтенда
    console.log('🔄 Simulating frontend balance loading...');
    
    // Получаем баланс USDT
    const usdtBalance = await usdtToken.balanceOf(userAddress);
    const usdtBalanceFormatted = parseFloat(ethers.utils.formatUnits(usdtBalance, 6));

    // Получаем баланс BTC
    const btcBalance = await btcToken.balanceOf(userAddress);
    const btcBalanceFormatted = parseFloat(ethers.utils.formatUnits(btcBalance, 8));

    // Получаем баланс ETH
    const ethBalance = await ethToken.balanceOf(userAddress);
    const ethBalanceFormatted = parseFloat(ethers.utils.formatUnits(ethBalance, 18));

    // Создаем массив балансов как во фронтенде
    const balances = [
      {
        symbol: 'USDT',
        balance: usdtBalanceFormatted,
        decimals: 6,
        address: CONTRACT_ADDRESSES.USDT_TOKEN,
        name: 'TradeShield USDT',
        valueUSD: usdtBalanceFormatted
      },
      {
        symbol: 'BTC',
        balance: btcBalanceFormatted,
        decimals: 8,
        address: CONTRACT_ADDRESSES.BTC_TOKEN,
        name: 'TradeShield BTC',
        valueUSD: btcBalanceFormatted * 110000 // Примерная цена BTC
      },
      {
        symbol: 'ETH',
        balance: ethBalanceFormatted,
        decimals: 18,
        address: CONTRACT_ADDRESSES.ETH_TOKEN,
        name: 'TradeShield ETH',
        valueUSD: ethBalanceFormatted * 3000 // Примерная цена ETH
      }
    ];

    console.log('📊 Frontend Balance Array:');
    console.log(JSON.stringify(balances, null, 2));

    // Проверяем, что балансы не равны нулю
    const hasUsdt = balances.find(b => b.symbol === 'USDT')?.balance > 0;
    const hasBtc = balances.find(b => b.symbol === 'BTC')?.balance > 0;
    const hasEth = balances.find(b => b.symbol === 'ETH')?.balance > 0;

    console.log('\n✅ Balance Check Results:');
    console.log(`   USDT > 0: ${hasUsdt} (${balances.find(b => b.symbol === 'USDT')?.balance})`);
    console.log(`   BTC > 0: ${hasBtc} (${balances.find(b => b.symbol === 'BTC')?.balance})`);
    console.log(`   ETH > 0: ${hasEth} (${balances.find(b => b.symbol === 'ETH')?.balance})`);

    if (hasUsdt) {
      console.log('\n🎉 SUCCESS: User has USDT balance!');
      console.log(`   USDT Amount: ${balances.find(b => b.symbol === 'USDT')?.balance}`);
    } else {
      console.log('\n❌ PROBLEM: User has NO USDT balance!');
    }

    console.log('\n✅ Frontend Balance Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendBalance();
