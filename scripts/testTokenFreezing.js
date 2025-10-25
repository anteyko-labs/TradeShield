// Тестирование системы заморозки токенов
function testTokenFreezing() {
  console.log('🔒 ТЕСТИРОВАНИЕ СИСТЕМЫ ЗАМОРОЗКИ ТОКЕНОВ');
  console.log('='.repeat(60));
  
  // Симуляция UserBalanceService
  class TestUserBalanceService {
    constructor() {
      this.frozenBalances = [];
      this.userBalances = {};
    }
    
    // Инициализация с реальными балансами
    initialize(userAddress) {
      this.userBalances[userAddress] = {
        'USDT': 997470997,
        'BTC': 20991999,
        'ETH': 119559990
      };
      console.log('💰 UserBalanceService инициализирован с реальными балансами:');
      console.log(`   USDT: ${this.userBalances[userAddress]['USDT']}`);
      console.log(`   BTC: ${this.userBalances[userAddress]['BTC']}`);
      console.log(`   ETH: ${this.userBalances[userAddress]['ETH']}`);
    }
    
    // Получить доступный баланс (общий - замороженный)
    getAvailableBalance(userId, token) {
      const totalBalance = this.userBalances[userId]?.[token] || 0;
      const frozenAmount = this.getFrozenAmount(userId, token);
      const available = Math.max(0, totalBalance - frozenAmount);
      
      console.log(`🔍 getAvailableBalance: ${token} для ${userId}`);
      console.log(`   Общий баланс: ${totalBalance}`);
      console.log(`   Заморожено: ${frozenAmount}`);
      console.log(`   Доступно: ${available}`);
      
      return available;
    }
    
    // Получить замороженную сумму
    getFrozenAmount(userId, token) {
      return this.frozenBalances
        .filter(fb => fb.userId === userId && fb.token === token)
        .reduce((sum, fb) => sum + fb.amount, 0);
    }
    
    // Заморозить токены для лимитного ордера
    freezeTokens(userId, token, amount, orderId) {
      const availableBalance = this.getAvailableBalance(userId, token);
      
      if (availableBalance < amount) {
        console.error(`❌ Недостаточно ${token} для заморозки. Доступно: ${availableBalance}, требуется: ${amount}`);
        return false;
      }

      const frozenBalance = {
        userId,
        token,
        amount,
        orderId,
        timestamp: Date.now()
      };

      this.frozenBalances.push(frozenBalance);
      console.log(`🔒 Заморожено ${amount} ${token} для ордера ${orderId} (доступно: ${availableBalance})`);
      return true;
    }
    
    // Разморозить токены
    unfreezeTokens(orderId) {
      const frozenIndex = this.frozenBalances.findIndex(fb => fb.orderId === orderId);
      
      if (frozenIndex === -1) {
        console.error(`❌ Замороженный баланс для ордера ${orderId} не найден`);
        return false;
      }

      const frozen = this.frozenBalances[frozenIndex];
      this.frozenBalances.splice(frozenIndex, 1);
      
      console.log(`🔓 Разморожено ${frozen.amount} ${frozen.token} для ордера ${orderId}`);
      return true;
    }
  }
  
  console.log('\n📊 ТЕСТ 1: ИНИЦИАЛИЗАЦИЯ С РЕАЛЬНЫМИ БАЛАНСАМИ');
  console.log('-'.repeat(50));
  
  const userBalanceService = new TestUserBalanceService();
  const userAddress = '0x513756b7ed711c472537cb497833c5d5eb02a3df';
  userBalanceService.initialize(userAddress);
  
  console.log('\n📊 ТЕСТ 2: ПРОВЕРКА ДОСТУПНОГО БАЛАНСА BTC');
  console.log('-'.repeat(50));
  
  const availableBTC = userBalanceService.getAvailableBalance(userAddress, 'BTC');
  console.log(`✅ Доступно BTC: ${availableBTC}`);
  
  console.log('\n📊 ТЕСТ 3: СОЗДАНИЕ ЛИМИТНОГО SELL ОРДЕРА НА 1 BTC');
  console.log('-'.repeat(50));
  
  const orderId = `order_${Date.now()}`;
  const freezeResult = userBalanceService.freezeTokens(userAddress, 'BTC', 1, orderId);
  
  if (freezeResult) {
    console.log('✅ Заморозка успешна!');
    
    // Проверяем доступный баланс после заморозки
    const availableAfterFreeze = userBalanceService.getAvailableBalance(userAddress, 'BTC');
    console.log(`💰 Доступно BTC после заморозки: ${availableAfterFreeze}`);
    
    console.log('\n📊 ТЕСТ 4: ОТМЕНА ОРДЕРА (РАЗМОРОЗКА)');
    console.log('-'.repeat(50));
    
    const unfreezeResult = userBalanceService.unfreezeTokens(orderId);
    if (unfreezeResult) {
      const availableAfterUnfreeze = userBalanceService.getAvailableBalance(userAddress, 'BTC');
      console.log(`💰 Доступно BTC после разморозки: ${availableAfterUnfreeze}`);
    }
  } else {
    console.log('❌ Заморозка не удалась!');
  }
  
  console.log('\n📊 ТЕСТ 5: ПОПЫТКА ЗАМОРОЗИТЬ БОЛЬШЕ ЧЕМ ДОСТУПНО');
  console.log('-'.repeat(50));
  
  const badOrderId = `bad_order_${Date.now()}`;
  const badFreezeResult = userBalanceService.freezeTokens(userAddress, 'BTC', 50000000, badOrderId);
  console.log(`Результат попытки заморозить 50M BTC: ${badFreezeResult ? 'Успех' : 'Ошибка (ожидаемо)'}`);
  
  console.log('\n✅ ТЕСТИРОВАНИЕ ЗАМОРОЗКИ ЗАВЕРШЕНО');
}

testTokenFreezing();
