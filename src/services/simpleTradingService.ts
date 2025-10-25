import { ethers } from 'ethers';

// Адреса токенов
const TOKEN_ADDRESSES = {
  USDT: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// ABI для токенов (без onlyOwner)
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)"
];

/**
 * Простой сервис для торговли без проверки владельца
 */
export class SimpleTradingService {
  public provider: ethers.providers.Provider | null = null;
  public signer: ethers.Signer | null = null;

  async initialize(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Минтить USDT пользователю (просто transfer от владельца)
   */
  async mintUSDT(userAddress: string, amount: number = 10000): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.signer) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      // Используем владельца контракта для перевода
      const ownerPrivateKey = process.env.PRIVATE_KEY;
      if (!ownerPrivateKey) {
        return { success: false, error: 'Owner private key not found' };
      }

      const ownerWallet = new ethers.Wallet(ownerPrivateKey, this.provider);
      const ownerUsdtContract = new ethers.Contract(TOKEN_ADDRESSES.USDT, TOKEN_ABI, ownerWallet);
      
      const amountParsed = ethers.utils.parseUnits(amount.toString(), 6); // USDT has 6 decimals

      console.log(`🚀 Transferring ${amount} USDT from owner to ${userAddress}...`);
      const tx = await ownerUsdtContract.transfer(userAddress, amountParsed);
      await tx.wait();

      console.log(`✅ ${amount} USDT transferred successfully!`);
      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('❌ Error transferring USDT:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Простая торговля: сжигаем токены, даем другие
   */
  async executeTrade(
    userAddress: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    price: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.signer) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const tokenInAddress = TOKEN_ADDRESSES[tokenIn as keyof typeof TOKEN_ADDRESSES];
      const tokenOutAddress = TOKEN_ADDRESSES[tokenOut as keyof typeof TOKEN_ADDRESSES];
      
      const tokenInContract = new ethers.Contract(tokenInAddress, TOKEN_ABI, this.signer);
      const tokenOutContract = new ethers.Contract(tokenOutAddress, TOKEN_ABI, this.signer);

      // Получаем десятичные знаки
      const tokenInDecimals = await tokenInContract.decimals();
      const tokenOutDecimals = await tokenOutContract.decimals();

      // Рассчитываем количество исходящих токенов
      let amountOut: number;
      if (tokenIn === 'USDT' && tokenOut === 'BTC') {
        amountOut = amountIn / price; // USDT / BTC_price
      } else if (tokenIn === 'USDT' && tokenOut === 'ETH') {
        amountOut = amountIn / (price / 1000); // USDT / ETH_price (примерно)
      } else if (tokenIn === 'BTC' && tokenOut === 'USDT') {
        amountOut = amountIn * price; // BTC * BTC_price
      } else if (tokenIn === 'ETH' && tokenOut === 'USDT') {
        amountOut = amountIn * (price / 1000); // ETH * ETH_price (примерно)
      } else {
        return { success: false, error: 'Unsupported trade pair' };
      }

      // Округляем до правильного количества десятичных знаков
      amountOut = Math.floor(amountOut * Math.pow(10, tokenOutDecimals)) / Math.pow(10, tokenOutDecimals);

      console.log(`💱 Trade: ${amountIn} ${tokenIn} -> ${amountOut} ${tokenOut}`);

      // 1. Сжигаем входящие токены
      const burnAmount = ethers.utils.parseUnits(amountIn.toString(), tokenInDecimals);
      const burnTx = await tokenInContract.transfer('0x000000000000000000000000000000000000dEaD', burnAmount);
      await burnTx.wait();

      // 2. Минтим исходящие токены (через transfer от владельца)
      const ownerPrivateKey = process.env.PRIVATE_KEY;
      if (!ownerPrivateKey) {
        return { success: false, error: 'Owner private key not found' };
      }

      const ownerWallet = new ethers.Wallet(ownerPrivateKey, this.provider);
      const ownerTokenOutContract = new ethers.Contract(tokenOutAddress, TOKEN_ABI, ownerWallet);
      
      const mintAmount = ethers.utils.parseUnits(amountOut.toString(), tokenOutDecimals);
      const mintTx = await ownerTokenOutContract.transfer(userAddress, mintAmount);
      await mintTx.wait();

      console.log(`✅ Trade executed: ${amountIn} ${tokenIn} -> ${amountOut} ${tokenOut}`);

      return {
        success: true,
        txHash: mintTx.hash
      };

    } catch (error) {
      console.error('❌ Error executing trade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const simpleTradingService = new SimpleTradingService();
