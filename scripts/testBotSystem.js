const { ethers } = require('ethers');

// Полное тестирование системы ботов
async function testBotSystem() {
  console.log('🤖 ПОЛНОЕ ТЕСТИРОВАНИЕ СИСТЕМЫ БОТОВ');
  console.log('='.repeat(60));
  
  const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
  
  // РЕАЛЬНЫЕ адреса токенов
  const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
  const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
  const ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
  
  const botData = [
    {
      id: 'bot_1',
      name: 'AlphaTrader',
      address: '0x482F4D85145f8A5494583e24efE2944C643825f6',
      privateKey: 'bade26f1b52b3a3b996c5854e2e0b07086958bebbe578b5fbb7942e43cb4bfa2'
    },
    {
      id: 'bot_2', 
      name: 'BetaBot',
      address: '0x78ACAcBf97666719345Ea5aCcb302C6F2283a76E',
      privateKey: 'f0760da538cbbf25a7ac8420a6955926659011bb3e7320a387384abad5b78b13'
    },
    {
      id: 'bot_3',
      name: 'GammaGains',
      address: '0x2bdE3eB40333319f53924A27C95d94122F1b9F52', 
      privateKey: 'f7e9e114c7aaa5f90db3ff755ea67aed1d424b84ee6f32748a065cac5e9b1cd3'
    },
    {
      id: 'bot_4',
      name: 'DeltaDex',
      address: '0x9b561AF79907654F0c31e5AE3497348520c73CF9',
      privateKey: '59ff506ca797f1c92856a4ee0f73b0b03c0ea90ec064f46cf6fa8d2cc4fa2725'
    }
  ];

  console.log('\n📊 ТЕСТ 1: ПРОВЕРКА РЕАЛЬНЫХ БАЛАНСОВ БОТОВ');
  console.log('-'.repeat(50));
  
  const bots = [];
  
  for (const data of botData) {
    try {
      console.log(`\n🤖 Тестируем ${data.name}...`);
      
      const wallet = new ethers.Wallet(data.privateKey, provider);
      console.log(`✅ Кошелек создан: ${wallet.address}`);
      
      // Проверяем баланс ETH
      const ethBalance = await provider.getBalance(data.address);
      console.log(`💰 ETH баланс: ${ethers.utils.formatEther(ethBalance)} ETH`);
      
      // Проверяем балансы токенов
      const usdtBalance = await getTokenBalance(data.address, USDT_ADDRESS, 6, provider);
      const btcBalance = await getTokenBalance(data.address, BTC_ADDRESS, 18, provider);
      const ethTokenBalance = await getTokenBalance(data.address, ETH_ADDRESS, 18, provider);
      
      console.log(`💰 USDT: ${usdtBalance}`);
      console.log(`💰 BTC: ${btcBalance}`);
      console.log(`💰 ETH токены: ${ethTokenBalance}`);
      
      const bot = {
        id: data.id,
        name: data.name,
        address: data.address,
        wallet,
        balances: {
          USDT: parseFloat(usdtBalance),
          BTC: parseFloat(btcBalance),
          ETH: parseFloat(ethTokenBalance)
        }
      };
      
      bots.push(bot);
      console.log(`✅ Бот ${data.name} готов к торговле`);
      
    } catch (error) {
      console.error(`❌ Ошибка с ботом ${data.name}:`, error.message);
    }
  }
  
  console.log('\n📊 ТЕСТ 2: СОЗДАНИЕ ОРДЕРОВ БОТАМИ');
  console.log('-'.repeat(50));
  
  const orders = { bids: [], asks: [] };
  
  bots.forEach(bot => {
    console.log(`\n🤖 ${bot.name} создает ордера...`);
    
    // Создаем bid ордер (покупка)
    const bidPrice = 65000 * (0.98 + Math.random() * 0.02);
    const bidAmount = Math.random() * 0.5 + 0.1;
    const bidTotal = bidAmount * bidPrice;
    
    const bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      botId: bot.id,
      botName: bot.name,
      side: 'buy',
      token: 'BTC',
      amount: bidAmount,
      price: bidPrice,
      total: bidTotal,
      size: bidAmount,
      timestamp: Date.now(),
      isActive: true
    };
    
    orders.bids.push(bid);
    console.log(`📝 Bid: ${bidAmount} BTC @ $${bidPrice.toFixed(2)}`);
    
    // Создаем ask ордер (продажа)
    const askPrice = 65000 * (1.00 + Math.random() * 0.02);
    const askAmount = Math.random() * 0.5 + 0.1;
    const askTotal = askAmount * askPrice;
    
    const ask = {
      id: `ask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      botId: bot.id,
      botName: bot.name,
      side: 'sell',
      token: 'BTC',
      amount: askAmount,
      price: askPrice,
      total: askTotal,
      size: askAmount,
      timestamp: Date.now(),
      isActive: true
    };
    
    orders.asks.push(ask);
    console.log(`📝 Ask: ${askAmount} BTC @ $${askPrice.toFixed(2)}`);
  });
  
  // Сортируем ордера
  orders.bids.sort((a, b) => b.price - a.price);
  orders.asks.sort((a, b) => a.price - b.price);
  
  console.log('\n📊 ТЕСТ 3: РЕЗУЛЬТАТЫ ОРДЕРБУКА');
  console.log('-'.repeat(50));
  console.log(`📈 Bid ордера (${orders.bids.length}):`);
  orders.bids.slice(0, 5).forEach((order, i) => {
    console.log(`  ${i+1}. ${order.botName}: ${order.amount} BTC @ $${order.price.toFixed(2)}`);
  });
  
  console.log(`📉 Ask ордера (${orders.asks.length}):`);
  orders.asks.slice(0, 5).forEach((order, i) => {
    console.log(`  ${i+1}. ${order.botName}: ${order.amount} BTC @ $${order.price.toFixed(2)}`);
  });
  
  console.log('\n✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
  console.log(`📊 Создано ${orders.bids.length} bid и ${orders.asks.length} ask ордеров`);
}

// Функция для получения баланса токена
async function getTokenBalance(address, tokenAddress, decimals, provider) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ], provider);

    const balance = await tokenContract.balanceOf(address);
    const tokenDecimals = await tokenContract.decimals();
    return ethers.utils.formatUnits(balance, tokenDecimals);
  } catch (error) {
    console.error(`Ошибка получения баланса токена:`, error.message);
    return '0';
  }
}

testBotSystem().catch(console.error);
