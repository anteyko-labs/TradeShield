import { ethers } from 'ethers';

export interface FrozenBalance {
  userId: string;
  token: string;
  amount: number;
  orderId: string;
  timestamp: number;
}

class UserBalanceService {
  private frozenBalances: FrozenBalance[] = [];
  private userBalances: { [userId: string]: { [token: string]: number } } = {};

  // Инициализация с Web3 провайдером
  async initialize(provider: ethers.providers.Web3Provider, signer: ethers.Signer): Promise<void> {
    const userAddress = await signer.getAddress();
    
    // Загружаем РЕАЛЬНЫЕ балансы из блокчейна
    await this.loadUserBalances(userAddress, provider);
    
    console.log('💰 UserBalanceService инициализирован с РЕАЛЬНЫМИ балансами из блокчейна');
  }

  // Загрузить балансы пользователя
  private async loadUserBalances(userAddress: string, provider: ethers.providers.Web3Provider): Promise<void> {
    const tokenAddresses = {
      'USDT': '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
      'BTC': '0xC941593909348e941420D5404Ab00b5363b1dDB4',
      'ETH': '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
    };

    this.userBalances[userAddress] = {};

    for (const [symbol, address] of Object.entries(tokenAddresses)) {
      try {
        const tokenContract = new ethers.Contract(address, [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ], provider);

        const balance = await tokenContract.balanceOf(userAddress);
        const decimals = await tokenContract.decimals();
        const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, decimals));
        
        this.userBalances[userAddress][symbol] = formattedBalance;
        console.log(`💰 ${symbol} баланс: ${formattedBalance}`);
      } catch (error) {
        console.error(`Ошибка загрузки баланса ${symbol}:`, error);
        this.userBalances[userAddress][symbol] = 0;
      }
    }
  }

  // Получить доступный баланс (общий - замороженный)
  getAvailableBalance(userId: string, token: string): number {
    const totalBalance = this.userBalances[userId]?.[token] || 0;
    const frozenAmount = this.getFrozenAmount(userId, token);
    const available = Math.max(0, totalBalance - frozenAmount);
    
    console.log(`🔍 getAvailableBalance: ${token} для ${userId}`);
    console.log(`   Общий баланс: ${totalBalance}`);
    console.log(`   Заморожено: ${frozenAmount}`);
    console.log(`   Доступно: ${available}`);
    
    return available;
  }

  // Получить общий баланс
  getTotalBalance(userId: string, token: string): number {
    return this.userBalances[userId]?.[token] || 0;
  }

  // Получить замороженную сумму
  getFrozenAmount(userId: string, token: string): number {
    return this.frozenBalances
      .filter(fb => fb.userId === userId && fb.token === token)
      .reduce((sum, fb) => sum + fb.amount, 0);
  }

  // Заморозить токены для лимитного ордера
  freezeTokens(userId: string, token: string, amount: number, orderId: string): boolean {
    const availableBalance = this.getAvailableBalance(userId, token);
    
    if (availableBalance < amount) {
      console.error(`❌ Недостаточно ${token} для заморозки. Доступно: ${availableBalance}, требуется: ${amount}`);
      return false;
    }

    // ВАЖНО: Замораживаем только указанное количество, НЕ весь баланс!
    const frozenBalance: FrozenBalance = {
      userId,
      token,
      amount, // Замораживаем только amount, не весь баланс!
      orderId,
      timestamp: Date.now()
    };

    this.frozenBalances.push(frozenBalance);
    console.log(`🔒 Заморожено ${amount} ${token} для ордера ${orderId} (доступно: ${availableBalance})`);
    return true;
  }

  // Разморозить токены (при отмене или выполнении ордера)
  unfreezeTokens(userId: string, token: string, amount: number, orderId: string): boolean {
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
  
  // Добавить токены (при покупке)
  addTokens(userId: string, token: string, amount: number): void {
    if (!this.userBalances[userId]) {
      this.userBalances[userId] = {};
    }
    
    if (!this.userBalances[userId][token]) {
      this.userBalances[userId][token] = 0;
    }
    
    this.userBalances[userId][token] += amount;
    console.log(`➕ Добавлено ${amount} ${token} пользователю ${userId}`);
  }
  
  // Списывать токены (при продаже)
  subtractTokens(userId: string, token: string, amount: number): void {
    if (!this.userBalances[userId] || !this.userBalances[userId][token]) {
      console.error(`❌ Недостаточно ${token} для списания`);
      return;
    }
    
    if (this.userBalances[userId][token] < amount) {
      console.error(`❌ Недостаточно ${token} для списания. Доступно: ${this.userBalances[userId][token]}, требуется: ${amount}`);
      return;
    }
    
    this.userBalances[userId][token] -= amount;
    console.log(`➖ Списано ${amount} ${token} у пользователя ${userId}`);
  }

  // Выполнить ордер (списать замороженные токены)
  executeOrder(orderId: string): boolean {
    const frozenIndex = this.frozenBalances.findIndex(fb => fb.orderId === orderId);
    
    if (frozenIndex === -1) {
      console.error(`❌ Замороженный баланс для ордера ${orderId} не найден`);
      return false;
    }

    const frozen = this.frozenBalances[frozenIndex];
    
    // Списываем токены с баланса
    if (this.userBalances[frozen.userId] && this.userBalances[frozen.userId][frozen.token] !== undefined) {
      this.userBalances[frozen.userId][frozen.token] -= frozen.amount;
    }
    
    // Удаляем заморозку
    this.frozenBalances.splice(frozenIndex, 1);
    
    console.log(`✅ Списано ${frozen.amount} ${frozen.token} для ордера ${orderId}`);
    return true;
  }

  // Получить все замороженные балансы пользователя
  getUserFrozenBalances(userId: string): FrozenBalance[] {
    return this.frozenBalances.filter(fb => fb.userId === userId);
  }

  // Обновить баланс после торговли
  updateBalance(userId: string, token: string, amount: number): void {
    if (!this.userBalances[userId]) {
      this.userBalances[userId] = {};
    }
    
    if (!this.userBalances[userId][token]) {
      this.userBalances[userId][token] = 0;
    }
    
    this.userBalances[userId][token] += amount;
    console.log(`💰 Обновлен баланс ${userId}: ${amount > 0 ? '+' : ''}${amount} ${token}`);
  }

  // Получить детальную информацию о балансах
  getBalanceInfo(userId: string, token: string) {
    const total = this.getTotalBalance(userId, token);
    const frozen = this.getFrozenAmount(userId, token);
    const available = this.getAvailableBalance(userId, token);
    
    return {
      total,
      frozen,
      available,
      frozenOrders: this.frozenBalances.filter(fb => fb.userId === userId && fb.token === token)
    };
  }

  // Очистить старые заморозки (старше 7 дней)
  clearOldFrozenBalances(): void {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const oldCount = this.frozenBalances.length;
    
    this.frozenBalances = this.frozenBalances.filter(fb => fb.timestamp > cutoffTime);
    
    const removedCount = oldCount - this.frozenBalances.length;
    if (removedCount > 0) {
      console.log(`🗑️ Очищено ${removedCount} старых заморозок`);
    }
  }

  // Получить статистику
  getStats() {
    const totalFrozen = this.frozenBalances.reduce((sum, fb) => sum + fb.amount, 0);
    const uniqueUsers = new Set(this.frozenBalances.map(fb => fb.userId)).size;
    
    return {
      totalFrozenBalances: this.frozenBalances.length,
      totalFrozenAmount: totalFrozen,
      uniqueUsers,
      tokens: [...new Set(this.frozenBalances.map(fb => fb.token))]
    };
  }

  // Добавить BTC токены пользователю для тестирования
  addBTCTokensToUser(userId: string, amount: number = 1): void {
    if (!this.userBalances[userId]) {
      this.userBalances[userId] = {};
    }
    
    if (!this.userBalances[userId]['BTC']) {
      this.userBalances[userId]['BTC'] = 0;
    }
    
    this.userBalances[userId]['BTC'] += amount;
    console.log(`💰 Добавлено ${amount} BTC пользователю ${userId}. Новый баланс: ${this.userBalances[userId]['BTC']}`);
  }
}

export const userBalanceService = new UserBalanceService();
