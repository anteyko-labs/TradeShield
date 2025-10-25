const { ethers } = require('ethers');

// Конфигурация
const RPC_URL = 'https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL, {
  name: 'sepolia',
  chainId: 11155111
});

// Адреса токенов
const TOKENS = {
  USDT: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// Ваш кошелек
const YOUR_WALLET = '0x513756b7ed711c472537cb497833c5d5eb02a3df';

// Кошельки ботов
const BOT_WALLETS = [
  {
    name: 'AlphaTrader',
    address: '0x482F4D85145f8A5494583e24efE2944C643825f6',
    privateKey: 'bade26f1b52b3a3b996c5854e2e0b07086958bebbe578b5fbb7942e43cb4bfa2'
  },
  {
    name: 'BetaBot',
    address: '0x78ACAcBf97666719345Ea5aCcb302C6F2283a76E',
    privateKey: 'f0760da538cbbf25a7ac8420a6955926659011bb3e7320a387384abad5b78b13'
  },
  {
    name: 'GammaGains',
    address: '0x2bdE3eB40333319f53924A27C95d94122F1b9F52',
    privateKey: 'f7e9e114c7aaa5f90db3ff755ea67aed1d424b84ee6f32748a065cac5e9b1cd3'
  },
  {
    name: 'DeltaDex',
    address: '0x4567890123456789012345678901234567890123',
    privateKey: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890'
  }
];

// ABI для ERC20 токенов
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// Функция для получения баланса токена
async function getTokenBalance(tokenAddress, walletAddress, tokenSymbol) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    const balance = await tokenContract.balanceOf(walletAddress);
    const decimals = await tokenContract.decimals();
    const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, decimals));
    
    return {
      symbol: tokenSymbol,
      balance: formattedBalance,
      rawBalance: balance.toString()
    };
  } catch (error) {
    console.error(`❌ Ошибка получения баланса ${tokenSymbol} для ${walletAddress}:`, error.message);
    return {
      symbol: tokenSymbol,
      balance: 0,
      rawBalance: '0'
    };
  }
}

// Функция для получения ETH баланса
async function getETHBalance(walletAddress) {
  try {
    const balance = await provider.getBalance(walletAddress);
    const formattedBalance = parseFloat(ethers.utils.formatEther(balance));
    return formattedBalance;
  } catch (error) {
    console.error(`❌ Ошибка получения ETH баланса для ${walletAddress}:`, error.message);
    return 0;
  }
}

// Основная функция
async function checkAllBalances() {
  console.log('🔍 ПРОВЕРКА БАЛАНСОВ ТОКЕНОВ');
  console.log('='.repeat(50));
  
  // Проверяем ваш кошелек
  console.log(`\n👤 ВАШ КОШЕЛЕК: ${YOUR_WALLET}`);
  console.log('-'.repeat(30));
  
  // ETH баланс
  const yourETH = await getETHBalance(YOUR_WALLET);
  console.log(`💰 ETH: ${yourETH.toFixed(6)} ETH`);
  
  // Токены
  for (const [symbol, address] of Object.entries(TOKENS)) {
    const tokenBalance = await getTokenBalance(address, YOUR_WALLET, symbol);
    console.log(`💰 ${symbol}: ${tokenBalance.balance.toFixed(6)} ${symbol}`);
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Проверяем кошельки ботов
  console.log('\n🤖 КОШЕЛЬКИ БОТОВ:');
  console.log('='.repeat(50));
  
  for (const bot of BOT_WALLETS) {
    console.log(`\n🤖 ${bot.name}: ${bot.address}`);
    console.log('-'.repeat(30));
    
    // ETH баланс
    const botETH = await getETHBalance(bot.address);
    console.log(`💰 ETH: ${botETH.toFixed(6)} ETH`);
    
    // Токены
    for (const [symbol, address] of Object.entries(TOKENS)) {
      const tokenBalance = await getTokenBalance(address, bot.address, symbol);
      console.log(`💰 ${symbol}: ${tokenBalance.balance.toFixed(6)} ${symbol}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ ПРОВЕРКА ЗАВЕРШЕНА');
}

// Запуск
checkAllBalances().catch(console.error);
