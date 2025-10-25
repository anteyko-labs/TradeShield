const { ethers } = require('ethers');

// Конфигурация
const RPC_URL = 'https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL, {
  name: 'sepolia',
  chainId: 11155111
});

// ВАШ ПРИВАТНЫЙ КЛЮЧ (замените на реальный!)
const YOUR_PRIVATE_KEY = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';

// Адреса токенов
const TOKENS = {
  USDT: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// Кошельки ботов
const BOT_WALLETS = [
  {
    name: 'AlphaTrader',
    address: '0x482F4D85145f8A5494583e24efE2944C643825f6'
  },
  {
    name: 'BetaBot', 
    address: '0x78ACAcBf97666719345Ea5aCcb302C6F2283a76E'
  },
  {
    name: 'GammaGains',
    address: '0x2bdE3eB40333319f53924A27C95d94122F1b9F52'
  },
  {
    name: 'DeltaDex',
    address: '0x4567890123456789012345678901234567890123'
  }
];

// ABI для ERC20 токенов
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Функция для перевода токенов
async function transferTokens(tokenAddress, toAddress, amount, tokenSymbol, fromWallet) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, fromWallet);
    
    // Получаем decimals
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
    
    // Проверяем баланс
    const balance = await tokenContract.balanceOf(fromWallet.address);
    if (balance.lt(amountWei)) {
      console.log(`❌ Недостаточно ${tokenSymbol}. Баланс: ${ethers.utils.formatUnits(balance, decimals)}`);
      return false;
    }
    
    console.log(`🔄 Перевод ${amount} ${tokenSymbol} на ${toAddress}...`);
    
    // Выполняем перевод
    const tx = await tokenContract.transfer(toAddress, amountWei, {
      gasLimit: 150000
    });
    
    console.log(`⏳ Ожидание подтверждения... TX: ${tx.hash}`);
    const receipt = await tx.wait();
    
    console.log(`✅ Успешно переведено ${amount} ${tokenSymbol} (Gas: ${receipt.gasUsed})`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка перевода ${tokenSymbol}:`, error.message);
    return false;
  }
}

// Основная функция
async function transferTokensToBots() {
  console.log('💰 РЕАЛЬНЫЙ ПЕРЕВОД ТОКЕНОВ БОТАМ');
  console.log('='.repeat(50));
  
  // Проверяем приватный ключ
  if (YOUR_PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
    console.log('❌ ОШИБКА: Замените YOUR_PRIVATE_KEY_HERE на ваш реальный приватный ключ!');
    console.log('🔑 Получить приватный ключ можно в MetaMask:');
    console.log('   1. Откройте MetaMask');
    console.log('   2. Нажмите на 3 точки → Account Details');
    console.log('   3. Export Private Key');
    console.log('⚠️  ВНИМАНИЕ: Никогда не делитесь приватным ключом!');
    return;
  }
  
  try {
    const fromWallet = new ethers.Wallet(YOUR_PRIVATE_KEY, provider);
    console.log(`👤 Отправитель: ${fromWallet.address}`);
    
    // Проверяем баланс ETH для газа
    const ethBalance = await provider.getBalance(fromWallet.address);
    console.log(`⛽ ETH для газа: ${ethers.utils.formatEther(ethBalance)} ETH`);
    
    if (ethBalance.lt(ethers.utils.parseEther('0.01'))) {
      console.log('❌ Недостаточно ETH для газа! Нужно минимум 0.01 ETH');
      return;
    }
    
    // Количество токенов для каждого бота
    const amounts = {
      USDT: 1000000,  // 1,000,000 USDT каждому боту
      BTC: 1000,      // 1,000 BTC каждому боту  
      ETH: 100000     // 100,000 ETH токенов каждому боту
    };
    
    console.log('\n📊 ПЛАН ПЕРЕВОДА:');
    console.log('-'.repeat(30));
    console.log(`💰 USDT: ${amounts.USDT.toLocaleString()} каждому боту`);
    console.log(`💰 BTC: ${amounts.BTC.toLocaleString()} каждому боту`);
    console.log(`💰 ETH: ${amounts.ETH.toLocaleString()} каждому боту`);
    console.log(`🤖 Количество ботов: ${BOT_WALLETS.length}`);
    
    let totalTransfers = 0;
    let successfulTransfers = 0;
    
    for (const bot of BOT_WALLETS) {
      console.log(`\n🤖 ${bot.name}: ${bot.address}`);
      console.log('-'.repeat(30));
      
      // Переводим каждый тип токена
      for (const [symbol, address] of Object.entries(TOKENS)) {
        totalTransfers++;
        const success = await transferTokens(
          address, 
          bot.address, 
          amounts[symbol], 
          symbol,
          fromWallet
        );
        
        if (success) {
          successfulTransfers++;
          console.log(`✅ ${symbol}: ${amounts[symbol].toLocaleString()} переведено`);
        } else {
          console.log(`❌ ${symbol}: ошибка перевода`);
        }
        
        // Небольшая пауза между переводами
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 ИТОГИ ПЕРЕВОДА:');
    console.log(`✅ Успешных переводов: ${successfulTransfers}/${totalTransfers}`);
    console.log(`💰 Общая сумма переводов: $${(amounts.USDT + amounts.BTC * 110000 + amounts.ETH * 3000).toLocaleString()}`);
    
    if (successfulTransfers === totalTransfers) {
      console.log('🎉 ВСЕ ПЕРЕВОДЫ УСПЕШНЫ! Боты готовы к торговле!');
    } else {
      console.log('⚠️  Некоторые переводы не удались. Проверьте логи выше.');
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

transferTokensToBots().catch(console.error);
