import { ethers } from 'ethers';

export interface UserTradeResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
}

class UserTradingService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer?: ethers.Signer;
  private dexContract?: ethers.Contract;
  
  // РЕАЛЬНЫЕ адреса
  private readonly DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
  private readonly USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';
  private readonly BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
  private readonly ETH_ADDRESS = '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb';
  
  // ABI для DEX
  private readonly DEX_ABI = [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external returns (bool)",
    "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)",
    "function executeBatch(address[] memory users, address[] memory tokensIn, address[] memory tokensOut, uint256[] memory amountsIn, uint256[] memory minAmountsOut) external returns (bool)"
  ];

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
  }

  async initialize(provider: ethers.providers.Web3Provider, signer: ethers.Signer): Promise<void> {
    this.provider = provider;
    this.signer = signer;
    this.dexContract = new ethers.Contract(this.DEX_ADDRESS, this.DEX_ABI, signer);
    console.log('👤 UserTradingService инициализирован');
  }

  // ПОКУПКА ТОКЕНА ПОЛЬЗОВАТЕЛЕМ (РЕАЛЬНЫЕ ТРАНЗАКЦИИ)
  async buyToken(tokenSymbol: string, usdtAmount: string): Promise<UserTradeResult> {
    if (!this.signer || !this.dexContract) {
      return { success: false, error: 'Сервис не инициализирован' };
    }

    try {
      console.log(`💰 РЕАЛЬНАЯ покупка ${tokenSymbol} за ${usdtAmount} USDT...`);
      
      const userAddress = await this.signer.getAddress();
      const tokenOutAddress = this.getTokenAddress(tokenSymbol);
      
      if (!tokenOutAddress) {
        return { success: false, error: `Токен ${tokenSymbol} не найден` };
      }

      // Проверяем баланс USDT в блокчейне
      const usdtContract = new ethers.Contract(this.USDT_ADDRESS, [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ], this.signer);

      const amountIn = ethers.utils.parseUnits(usdtAmount, 6); // USDT имеет 6 decimals
      const usdtBalance = await usdtContract.balanceOf(userAddress);

      if (usdtBalance.lt(amountIn)) {
        return { success: false, error: 'Недостаточно USDT в кошельке' };
      }

      // Получаем ожидаемое количество токенов
      const amountOut = await this.dexContract.getAmountOut(this.USDT_ADDRESS, tokenOutAddress, amountIn);
      const minAmountOut = amountOut.mul(95).div(100); // 5% slippage

      // Одобряем трату USDT (MetaMask вызовется!)
      const approveTx = await usdtContract.approve(this.DEX_ADDRESS, amountIn);
      await approveTx.wait();

      // Выполняем свап (MetaMask вызовется!)
      const swapTx = await this.dexContract.swap(
        this.USDT_ADDRESS,
        tokenOutAddress,
        amountIn,
        minAmountOut,
        { gasLimit: 300000 }
      );

      const receipt = await swapTx.wait();
      
      console.log(`✅ РЕАЛЬНАЯ покупка успешна! TX: ${swapTx.hash}`);
      
      return {
        success: true,
        txHash: swapTx.hash,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('❌ Ошибка реальной покупки:', error);
      return {
        success: false,
        error: error.message || 'Неизвестная ошибка'
      };
    }
  }

  // ПРОДАЖА ТОКЕНА ПОЛЬЗОВАТЕЛЕМ (РЕАЛЬНЫЕ ТРАНЗАКЦИИ)
  async sellToken(tokenSymbol: string, tokenAmount: string): Promise<UserTradeResult> {
    if (!this.signer || !this.dexContract) {
      return { success: false, error: 'Сервис не инициализирован' };
    }

    try {
      console.log(`💸 РЕАЛЬНАЯ продажа ${tokenAmount} ${tokenSymbol}...`);
      
      const userAddress = await this.signer.getAddress();
      const tokenInAddress = this.getTokenAddress(tokenSymbol);
      
      if (!tokenInAddress) {
        return { success: false, error: `Токен ${tokenSymbol} не найден` };
      }

      // Проверяем баланс токена в блокчейне
      const tokenContract = new ethers.Contract(tokenInAddress, [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ], this.signer);

      // Правильные decimals для каждого токена
      const decimals = tokenSymbol === 'BTC' ? 8 :   // BTC имеет 8 decimals!
                      tokenSymbol === 'ETH' ? 18 : 6; // USDT имеет 6 decimals
      const amountIn = ethers.utils.parseUnits(tokenAmount, decimals);
      const tokenBalance = await tokenContract.balanceOf(userAddress);

      if (tokenBalance.lt(amountIn)) {
        return { success: false, error: `Недостаточно ${tokenSymbol} в кошельке` };
      }

      // Получаем ожидаемое количество USDT
      const amountOut = await this.dexContract.getAmountOut(tokenInAddress, this.USDT_ADDRESS, amountIn);
      const minAmountOut = amountOut.mul(95).div(100); // 5% slippage

      // Одобряем трату токена (MetaMask вызовется!)
      const approveTx = await tokenContract.approve(this.DEX_ADDRESS, amountIn);
      await approveTx.wait();

      // Выполняем свап (MetaMask вызовется!)
      const swapTx = await this.dexContract.swap(
        tokenInAddress,
        this.USDT_ADDRESS,
        amountIn,
        minAmountOut,
        { gasLimit: 300000 }
      );

      const receipt = await swapTx.wait();
      
      console.log(`✅ РЕАЛЬНАЯ продажа успешна! TX: ${swapTx.hash}`);
      
      return {
        success: true,
        txHash: swapTx.hash,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('❌ Ошибка реальной продажи:', error);
      return {
        success: false,
        error: error.message || 'Неизвестная ошибка'
      };
    }
  }

  // Получить адрес токена
  private getTokenAddress(symbol: string): string | null {
    switch (symbol.toUpperCase()) {
      case 'USDT': return this.USDT_ADDRESS;
      case 'BTC': return this.BTC_ADDRESS;
      case 'ETH': return this.ETH_ADDRESS;
      default: return null;
    }
  }

  // Получить баланс токена
  async getTokenBalance(tokenSymbol: string): Promise<string> {
    if (!this.signer) return '0';
    
    try {
      const tokenAddress = this.getTokenAddress(tokenSymbol);
      if (!tokenAddress) return '0';
      
      const tokenContract = new ethers.Contract(tokenAddress, [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ], this.provider);

      const userAddress = await this.signer.getAddress();
      const balance = await tokenContract.balanceOf(userAddress);
      const decimals = await tokenContract.decimals();
      
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
      return '0';
    }
  }
}

export const userTradingService = new UserTradingService();
