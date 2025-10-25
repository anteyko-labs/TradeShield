const { ethers } = require('ethers');

// Тестируем создание ботов
async function testBots() {
  console.log('🤖 ТЕСТИРОВАНИЕ БОТОВ');
  console.log('='.repeat(50));
  
  const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
  
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
    }
  ];

  for (const data of botData) {
    try {
      console.log(`\n🤖 Тестируем ${data.name}...`);
      
      const wallet = new ethers.Wallet(data.privateKey, provider);
      console.log(`✅ Кошелек создан: ${wallet.address}`);
      
      // Проверяем баланс ETH
      const ethBalance = await provider.getBalance(data.address);
      console.log(`💰 ETH баланс: ${ethers.utils.formatEther(ethBalance)} ETH`);
      
      // Создаем тестовый ордер
      const testOrder = {
        id: `test_${Date.now()}`,
        botId: data.id,
        botName: data.name,
        side: 'buy',
        token: 'BTC',
        amount: 0.1,
        price: 65000,
        total: 6500,
        size: 0.1,
        timestamp: Date.now(),
        isActive: true
      };
      
      console.log(`📝 Тестовый ордер создан:`, testOrder);
      
    } catch (error) {
      console.error(`❌ Ошибка с ботом ${data.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Тестирование завершено');
}

testBots().catch(console.error);
