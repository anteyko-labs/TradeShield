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
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

async function checkUserBalance() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  try {
    console.log('🔍 Checking User Balance...\n');
    
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const userAddress = await wallet.getAddress();
    
    console.log(`👤 User Address: ${userAddress}`);
    console.log(`🔗 Network: Sepolia Testnet\n`);

    // Инициализируем контракты
    const usdtToken = new ethers.Contract(CONTRACT_ADDRESSES.USDT_TOKEN, TOKEN_ABI, provider);
    const btcToken = new ethers.Contract(CONTRACT_ADDRESSES.BTC_TOKEN, TOKEN_ABI, provider);
    const ethToken = new ethers.Contract(CONTRACT_ADDRESSES.ETH_TOKEN, TOKEN_ABI, provider);

    // Проверяем информацию о токенах
    console.log('📋 Token Information:');
    try {
      const usdtName = await usdtToken.name();
      const usdtSymbol = await usdtToken.symbol();
      const usdtDecimals = await usdtToken.decimals();
      const usdtTotalSupply = await usdtToken.totalSupply();
      
      console.log(`   USDT Token: ${usdtName} (${usdtSymbol})`);
      console.log(`   Decimals: ${usdtDecimals}`);
      console.log(`   Total Supply: ${ethers.utils.formatUnits(usdtTotalSupply, usdtDecimals)}`);
    } catch (error) {
      console.log(`   USDT Token: Error - ${error.message}`);
    }

    // Проверяем балансы пользователя
    console.log('\n💰 User Balances:');
    
    try {
      const usdtBalance = await usdtToken.balanceOf(userAddress);
      const usdtBalanceFormatted = ethers.utils.formatUnits(usdtBalance, 6);
      console.log(`   USDT: ${usdtBalanceFormatted} (Raw: ${usdtBalance.toString()})`);
    } catch (error) {
      console.log(`   USDT: Error - ${error.message}`);
    }

    try {
      const btcBalance = await btcToken.balanceOf(userAddress);
      const btcBalanceFormatted = ethers.utils.formatUnits(btcBalance, 8);
      console.log(`   BTC: ${btcBalanceFormatted} (Raw: ${btcBalance.toString()})`);
    } catch (error) {
      console.log(`   BTC: Error - ${error.message}`);
    }

    try {
      const ethBalance = await ethToken.balanceOf(userAddress);
      const ethBalanceFormatted = ethers.utils.formatUnits(ethBalance, 18);
      console.log(`   ETH: ${ethBalanceFormatted} (Raw: ${ethBalance.toString()})`);
    } catch (error) {
      console.log(`   ETH: Error - ${error.message}`);
    }

    // Проверяем баланс владельца контракта
    console.log('\n👑 Owner Balance Check:');
    try {
      const ownerAddress = userAddress; // Это владелец контракта
      const ownerUsdtBalance = await usdtToken.balanceOf(ownerAddress);
      const ownerUsdtFormatted = ethers.utils.formatUnits(ownerUsdtBalance, 6);
      console.log(`   Owner USDT: ${ownerUsdtFormatted}`);
      
      if (ownerUsdtBalance.gt(0)) {
        console.log('   ✅ Owner has USDT balance');
      } else {
        console.log('   ❌ Owner has NO USDT balance');
      }
    } catch (error) {
      console.log(`   Owner Balance: Error - ${error.message}`);
    }

    // Проверяем, можем ли мы минтить токены
    console.log('\n🔧 Minting Test:');
    try {
      const mintAmount = ethers.utils.parseUnits('1000', 6); // 1,000 USDT
      
      // Создаем контракт с правами владельца
      const ownerWallet = new ethers.Wallet(PRIVATE_KEY, provider);
      const ownerUsdtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDT_TOKEN,
        [
          "function mint(address to, uint256 amount) external",
          "function balanceOf(address account) view returns (uint256)"
        ],
        ownerWallet
      );

      console.log('   Attempting to mint 1,000 USDT...');
      const mintTx = await ownerUsdtContract.mint(userAddress, mintAmount);
      console.log(`   ✅ Mint transaction sent: ${mintTx.hash}`);
      
      await mintTx.wait();
      console.log('   ✅ Mint transaction confirmed');
      
      // Проверяем новый баланс
      const newBalance = await usdtToken.balanceOf(userAddress);
      const newBalanceFormatted = ethers.utils.formatUnits(newBalance, 6);
      console.log(`   New USDT Balance: ${newBalanceFormatted}`);
      
    } catch (error) {
      console.log(`   ❌ Minting failed: ${error.message}`);
    }

    console.log('\n✅ Balance Check Complete!');

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkUserBalance();
