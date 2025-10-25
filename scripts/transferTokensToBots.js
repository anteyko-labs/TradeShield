const { ethers } = require('ethers');

// Конфигурация
const RPC_URL = 'https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL, {
  name: 'sepolia',
  chainId: 11155111
});

// Ваш кошелек (отправитель)
const YOUR_PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE'; // Вставьте ваш приватный ключ
const yourWallet = new ethers.Wallet(YOUR_PRIVATE_KEY, provider);

// Адреса токенов
const TOKENS = {
  USDT: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// Кошельки ботов
const BOT_WALLETS = [
  '0x482F4D85145f8A5494583e24efE2944C643825f6', // AlphaTrader
  '0x78ACAcBf97666719345Ea5aCcb302C6F2283a76E', // BetaBot
  '0x2bdE3eB40333319f53924A27C95d94122F1b9F52', // GammaGains
  '0x4567890123456789012345678901234567890123'  // DeltaDex
];

// ABI для ERC20 токенов
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Функция для перевода токенов
async function transferTokens(tokenAddress, toAddress, amount, tokenSymbol) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, yourWallet);
    
    // Получаем decimals
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
    
    console.log(`🔄 Перевод ${amount} ${tokenSymbol} на ${toAddress}...`);
    
    // Выполняем перевод
    const tx = await tokenContract.transfer(toAddress, amountWei, {
      gasLimit: 100000
    });
    
    console.log(`⏳ Ожидание подтверждения... TX: ${tx.hash}`);
    await tx.wait();
    
    console.log(`✅ Успешно переведено ${amount} ${tokenSymbol}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка перевода ${tokenSymbol}:`, error.message);
    return false;
  }
}

// Основная функция
async function transferTokensToBots() {
  console.log('🔄 ПЕРЕВОД ТОКЕНОВ БОТАМ');
  console.log('='.repeat(50));
  
  // Количество токенов для каждого бота
  const amounts = {
    USDT: 100000,  // 100,000 USDT каждому боту
    BTC: 1000,     // 1,000 BTC каждому боту
    ETH: 10000     // 10,000 ETH токенов каждому боту
  };
  
  for (const botAddress of BOT_WALLETS) {
    console.log(`\n🤖 Бот: ${botAddress}`);
    console.log('-'.repeat(30));
    
    // Переводим каждый тип токена
    for (const [symbol, address] of Object.entries(TOKENS)) {
      const success = await transferTokens(
        address, 
        botAddress, 
        amounts[symbol], 
        symbol
      );
      
      if (success) {
        console.log(`✅ ${symbol}: ${amounts[symbol]} переведено`);
      } else {
        console.log(`❌ ${symbol}: ошибка перевода`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ ПЕРЕВОД ЗАВЕРШЕН');
}

// Проверка приватного ключа
if (YOUR_PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
  console.log('❌ ОШИБКА: Замените YOUR_PRIVATE_KEY_HERE на ваш реальный приватный ключ!');
  console.log('⚠️  ВНИМАНИЕ: Никогда не делитесь приватным ключом!');
} else {
  transferTokensToBots().catch(console.error);
}
