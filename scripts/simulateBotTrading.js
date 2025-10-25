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

// Симуляция балансов ботов
const SIMULATED_BALANCES = {
  '0x482F4D85145f8A5494583e24efE2944C643825f6': {
    USDT: 50000,
    BTC: 500,
    ETH: 5000
  },
  '0x78ACAcBf97666719345Ea5aCcb302C6F2283a76E': {
    USDT: 75000,
    BTC: 750,
    ETH: 7500
  },
  '0x2bdE3eB40333319f53924A27C95d94122F1b9F52': {
    USDT: 60000,
    BTC: 600,
    ETH: 6000
  },
  '0x4567890123456789012345678901234567890123': {
    USDT: 80000,
    BTC: 800,
    ETH: 8000
  }
};

// Генерация случайных ордеров
function generateRandomOrder(bot) {
  const tokens = ['USDT', 'BTC', 'ETH'];
  const sides = ['buy', 'sell'];
  
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const side = sides[Math.floor(Math.random() * sides.length)];
  
  // Генерируем случайные цены
  const basePrices = {
    USDT: 1,
    BTC: 110000,
    ETH: 3000
  };
  
  const basePrice = basePrices[token];
  const priceVariation = 0.05; // ±5%
  const price = basePrice * (1 + (Math.random() - 0.5) * priceVariation);
  
  // Генерируем случайное количество
  const maxAmount = SIMULATED_BALANCES[bot.address][token] || 1000;
  const amount = Math.random() * maxAmount * 0.1; // 10% от баланса
  
  return {
    bot: bot.name,
    address: bot.address,
    side,
    token,
    amount: parseFloat(amount.toFixed(6)),
    price: parseFloat(price.toFixed(2)),
    total: parseFloat((amount * price).toFixed(2))
  };
}

// Основная функция
async function simulateBotTrading() {
  console.log('🤖 СИМУЛЯЦИЯ ТОРГОВЛИ БОТОВ');
  console.log('='.repeat(50));
  
  console.log('\n📊 СИМУЛИРОВАННЫЕ БАЛАНСЫ БОТОВ:');
  console.log('-'.repeat(30));
  
  for (const bot of BOT_WALLETS) {
    const balances = SIMULATED_BALANCES[bot.address];
    console.log(`\n🤖 ${bot.name}:`);
    console.log(`   💰 USDT: ${balances.USDT.toLocaleString()}`);
    console.log(`   💰 BTC: ${balances.BTC.toLocaleString()}`);
    console.log(`   💰 ETH: ${balances.ETH.toLocaleString()}`);
  }
  
  console.log('\n📈 ГЕНЕРАЦИЯ ОРДЕРОВ:');
  console.log('-'.repeat(30));
  
  const orders = [];
  
  // Генерируем 20 случайных ордеров
  for (let i = 0; i < 20; i++) {
    const randomBot = BOT_WALLETS[Math.floor(Math.random() * BOT_WALLETS.length)];
    const order = generateRandomOrder(randomBot);
    orders.push(order);
    
    console.log(`📝 ${order.bot}: ${order.side.toUpperCase()} ${order.amount.toFixed(4)} ${order.token} @ $${order.price}`);
  }
  
  // Группируем ордера по типу
  const buyOrders = orders.filter(o => o.side === 'buy');
  const sellOrders = orders.filter(o => o.side === 'sell');
  
  console.log('\n📊 СТАТИСТИКА:');
  console.log('-'.repeat(30));
  console.log(`📈 Buy ордеров: ${buyOrders.length}`);
  console.log(`📉 Sell ордеров: ${sellOrders.length}`);
  console.log(`💰 Общий объем: $${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`);
  
  // Показываем топ ордера
  console.log('\n🏆 ТОП-5 BUY ОРДЕРОВ:');
  console.log('-'.repeat(30));
  buyOrders
    .sort((a, b) => b.price - a.price)
    .slice(0, 5)
    .forEach((order, index) => {
      console.log(`${index + 1}. ${order.bot}: ${order.amount.toFixed(4)} ${order.token} @ $${order.price}`);
    });
  
  console.log('\n🏆 ТОП-5 SELL ОРДЕРОВ:');
  console.log('-'.repeat(30));
  sellOrders
    .sort((a, b) => a.price - b.price)
    .slice(0, 5)
    .forEach((order, index) => {
      console.log(`${index + 1}. ${order.bot}: ${order.amount.toFixed(4)} ${order.token} @ $${order.price}`);
    });
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ СИМУЛЯЦИЯ ЗАВЕРШЕНА');
  console.log('💡 Эти ордера можно использовать для заполнения ордербука!');
}

simulateBotTrading().catch(console.error);
