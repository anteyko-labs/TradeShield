import { ethers } from 'ethers';

// Реальные адреса контрактов с Sepolia
const CONTRACT_ADDRESSES = {
  TOKEN_REGISTRY: '0x0557CF561B428bCf9cDD8b49044E330Ae8BBDa34',
  DEX: '0xCcA67eB690872566C1260F4777BfE7C79ff4047d',
  WALLET: '0x72bfaa294E6443E944ECBdad428224cC050C658E',
  BTC_TOKEN: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH_TOKEN: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb',
  USDT_TOKEN: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6'
};

// ABI для работы с контрактами
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function transferFrom(address,address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

const DEX_ABI = [
  "function swap(address,address,uint256,uint256) returns (uint256)",
  "function getPairInfo(address,address) view returns (tuple(address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, uint256 totalLiquidity, bool isActive, uint256 lastPrice, uint256 priceUpdateTime))",
  "function getUserTrades(address) view returns (uint256[])",
  "function getTrade(uint256) view returns (tuple(address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 price, uint256 timestamp, bytes32 txHash))",
  "function createPair(address,address,uint256,uint256)"
];

const WALLET_ABI = [
  "function getBalance(address,address) view returns (uint256)",
  "function getAllBalances(address) view returns (address[], uint256[])",
  "function getPositions(address) view returns (tuple(address token, uint256 amount, uint256 entryPrice, uint256 timestamp, bool isLong)[])",
  "function depositToken(address,address,uint256)",
  "function withdrawToken(address,address,uint256)"
];

/**
 * @title RealTradingService
 * @dev Сервис для РЕАЛЬНОЙ торговли через смарт-контракты
 * Никаких моков - только реальные данные из блокчейна!
 */
class RealTradingService {
  public provider: ethers.providers.Provider | null = null;
  public signer: ethers.Signer | null = null;
  public dex: ethers.Contract | null = null;
  public wallet: ethers.Contract | null = null;
  public usdtToken: ethers.Contract | null = null;
  public btcToken: ethers.Contract | null = null;
  public ethToken: ethers.Contract | null = null;

  async initialize(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    // Инициализируем контракты
    this.dex = new ethers.Contract(CONTRACT_ADDRESSES.DEX, DEX_ABI, signer);
    this.wallet = new ethers.Contract(CONTRACT_ADDRESSES.WALLET, WALLET_ABI, signer);
    this.usdtToken = new ethers.Contract(CONTRACT_ADDRESSES.USDT_TOKEN, TOKEN_ABI, signer);
    this.btcToken = new ethers.Contract(CONTRACT_ADDRESSES.BTC_TOKEN, TOKEN_ABI, signer);
    this.ethToken = new ethers.Contract(CONTRACT_ADDRESSES.ETH_TOKEN, TOKEN_ABI, signer);
    
    // Автоматически минтим 1,000,000 USDT для владельца при инициализации
    await this.autoMintMillionUSDT();
    
    console.log('✅ Real trading service initialized with deployed contracts');
  }

  /**
   * @dev Получить реальные балансы пользователя
   */
  async getRealBalances(userAddress: string) {
    if (!this.wallet || !this.usdtToken) {
      console.log('⚠️ Service not initialized, attempting to initialize...');
      if (this.provider && this.signer) {
        await this.initialize(this.provider, this.signer);
      } else {
        throw new Error('Service not initialized and no provider/signer available');
      }
    }

    try {
      // Получаем баланс USDT напрямую из токена
      const usdtBalance = await this.usdtToken.balanceOf(userAddress);
      const usdtBalanceFormatted = parseFloat(ethers.utils.formatUnits(usdtBalance, 6));

      // Получаем баланс BTC
      const btcBalance = await this.btcToken.balanceOf(userAddress);
      const btcBalanceFormatted = parseFloat(ethers.utils.formatUnits(btcBalance, 8));

      // Получаем баланс ETH
      const ethBalance = await this.ethToken.balanceOf(userAddress);
      const ethBalanceFormatted = parseFloat(ethers.utils.formatUnits(ethBalance, 18));

      return [
        {
          symbol: 'USDT',
          balance: usdtBalanceFormatted,
          decimals: 6,
          address: CONTRACT_ADDRESSES.USDT_TOKEN,
          name: 'TradeShield USDT',
          valueUSD: usdtBalanceFormatted
        },
        {
          symbol: 'BTC',
          balance: btcBalanceFormatted,
          decimals: 8,
          address: CONTRACT_ADDRESSES.BTC_TOKEN,
          name: 'TradeShield BTC',
          valueUSD: btcBalanceFormatted * 110000 // Примерная цена BTC
        },
        {
          symbol: 'ETH',
          balance: ethBalanceFormatted,
          decimals: 18,
          address: CONTRACT_ADDRESSES.ETH_TOKEN,
          name: 'TradeShield ETH',
          valueUSD: ethBalanceFormatted * 3200 // Примерная цена ETH
        }
      ];
    } catch (error) {
      console.error('Error getting real balances:', error);
      throw error;
    }
  }

  /**
   * @dev Выполнить реальную торговлю
   */
  async executeRealTrade(
    userAddress: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    minAmountOut: number
  ) {
    if (!this.dex || !this.usdtToken) {
      throw new Error('Service not initialized');
    }

    try {
      // Получаем адрес токена
      const tokenInAddress = this.getTokenAddress(tokenIn);
      const tokenOutAddress = this.getTokenAddress(tokenOut);

      // Проверяем баланс
      const tokenContract = new ethers.Contract(tokenInAddress, TOKEN_ABI, this.signer!);
      const balance = await tokenContract.balanceOf(userAddress);
      const requiredAmount = ethers.utils.parseUnits(amountIn.toString(), this.getTokenDecimals(tokenIn));

      if (balance.lt(requiredAmount)) {
        throw new Error(`Insufficient ${tokenIn} balance`);
      }

      // Одобряем трату
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.DEX, requiredAmount);
      await approveTx.wait();

      // Выполняем свап
      const swapTx = await this.dex.swap(
        tokenInAddress,
        tokenOutAddress,
        requiredAmount,
        ethers.utils.parseUnits(minAmountOut.toString(), this.getTokenDecimals(tokenOut))
      );

      const receipt = await swapTx.wait();

      return {
        success: true,
        txHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error executing real trade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * @dev Получить реальную цену токена
   */
  async getRealTokenPrice(tokenA: string, tokenB: string = 'USDT') {
    if (!this.dex) {
      throw new Error('Service not initialized');
    }

    try {
      const tokenAAddress = this.getTokenAddress(tokenA);
      const tokenBAddress = this.getTokenAddress(tokenB);
      
      const pairInfo = await this.dex.getPairInfo(tokenAAddress, tokenBAddress);
      return parseFloat(ethers.utils.formatUnits(pairInfo.lastPrice, 6));
    } catch (error) {
      console.error('Error getting real token price:', error);
      return 0;
    }
  }

  /**
   * @dev Получить реальные торговли пользователя
   */
  async getRealTrades(userAddress: string) {
    if (!this.dex) {
      throw new Error('Service not initialized');
    }

    try {
      const tradeIds = await this.dex.getUserTrades(userAddress);
      const trades = [];

      for (const tradeId of tradeIds) {
        const trade = await this.dex.getTrade(tradeId);
        trades.push({
          id: tradeId.toString(),
          symbol: 'USDT',
          side: 'buy',
          amount: parseFloat(ethers.utils.formatUnits(trade.amountIn, 6)),
          price: parseFloat(ethers.utils.formatUnits(trade.price, 6)),
          timestamp: trade.timestamp.toNumber(),
          txHash: trade.txHash,
          status: 'confirmed'
        });
      }

      return trades;
    } catch (error) {
      console.error('Error getting real trades:', error);
      return [];
    }
  }

  /**
   * @dev Получить адрес токена
   */
  private getTokenAddress(symbol: string): string {
    switch (symbol.toUpperCase()) {
      case 'USDT': return CONTRACT_ADDRESSES.USDT_TOKEN;
      case 'BTC': return CONTRACT_ADDRESSES.BTC_TOKEN;
      case 'ETH': return CONTRACT_ADDRESSES.ETH_TOKEN;
      default: throw new Error(`Unknown token: ${symbol}`);
    }
  }

  /**
   * @dev Получить decimals токена
   */
  private getTokenDecimals(symbol: string): number {
    switch (symbol.toUpperCase()) {
      case 'USDT': return 6;
      case 'BTC': return 8;
      case 'ETH': return 18;
      default: return 18;
    }
  }

  /**
   * @dev Автоматически заминтить 1,000,000 USDT для владельца
   */
  async autoMintMillionUSDT() {
    try {
      const ownerPrivateKey = process.env.PRIVATE_KEY;
      if (!ownerPrivateKey) {
        console.log('⚠️ PRIVATE_KEY not found, skipping auto-mint');
        return;
      }

      const ownerWallet = new ethers.Wallet(ownerPrivateKey, this.provider);
      const ownerUsdtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDT_TOKEN,
        [
          "function mint(address to, uint256 amount) public onlyOwner",
          "function balanceOf(address account) view returns (uint256)"
        ],
        ownerWallet
      );

      // Проверяем баланс владельца
      const ownerBalance = await ownerUsdtContract.balanceOf(await ownerWallet.getAddress());
      const amount = ethers.utils.parseUnits('1000000', 6); // 1,000,000 USDT
      
      if (ownerBalance.gte(amount)) {
        console.log('✅ Owner already has sufficient USDT balance');
        return;
      }

      console.log('🚀 Auto-minting 1,000,000 USDT for owner...');
      const tx = await ownerUsdtContract.mint(await ownerWallet.getAddress(), amount);
      await tx.wait();
      console.log('✅ 1,000,000 USDT auto-minted for owner');
      
    } catch (error) {
      console.error('❌ Error in auto-mint:', error);
      // Не выбрасываем ошибку, чтобы не блокировать инициализацию
    }
  }

  /**
   * @dev Выдать начальный USDT пользователю
   */
  async grantInitialUSDT(userAddress: string) {
    if (!this.usdtToken || !this.signer) {
      throw new Error('Service not initialized');
    }

    try {
      // Проверяем, есть ли уже баланс
      const balance = await this.usdtToken.balanceOf(userAddress);
      if (balance.gt(0)) {
        console.log('✅ User already has USDT balance');
        return;
      }

      // Создаем новый контракт от имени владельца (используем приватный ключ)
      const ownerPrivateKey = process.env.PRIVATE_KEY;
      if (!ownerPrivateKey) {
        throw new Error('PRIVATE_KEY not found in environment');
      }

      const ownerWallet = new ethers.Wallet(ownerPrivateKey, this.provider);
      const ownerUsdtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDT_TOKEN,
        [
          "function transfer(address to, uint256 amount) returns (bool)",
          "function balanceOf(address account) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ],
        ownerWallet
      );

      // Проверяем баланс владельца
      const ownerBalance = await ownerUsdtContract.balanceOf(await ownerWallet.getAddress());
      const amount = ethers.utils.parseUnits('10000', 6); // 10,000 USDT с 6 decimals
      
      if (ownerBalance.lt(amount)) {
        throw new Error(`Owner has insufficient USDT balance. Has: ${ethers.utils.formatUnits(ownerBalance, 6)}, Needs: ${ethers.utils.formatUnits(amount, 6)}`);
      }

      console.log(`🚀 Transferring 10,000 USDT from owner to ${userAddress}...`);
      
      const tx = await ownerUsdtContract.transfer(userAddress, amount);
      console.log(`⏳ Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      console.log('✅ 10,000 USDT successfully transferred to user:', userAddress);
      
    } catch (error) {
      console.error('❌ Error granting initial USDT:', error);
      throw error;
    }
  }

  /**
   * @dev Получить общую стоимость портфолио
   */
  async getTotalPortfolioValue(userAddress: string): Promise<number> {
    try {
      const balances = await this.getRealBalances(userAddress);
      return balances.reduce((total, token) => total + token.valueUSD, 0);
    } catch (error) {
      console.error('Error getting total portfolio value:', error);
      return 0;
    }
  }
}

export const realTradingService = new RealTradingService();
