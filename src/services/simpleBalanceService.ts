import { ethers } from 'ethers';

// Адреса токенов
const TOKEN_ADDRESSES = {
  USDT: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// Простой ABI для токенов
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

/**
 * Простой сервис для получения баланса токенов
 */
export class SimpleBalanceService {
  public provider: ethers.providers.Provider | null = null;

  async initialize(provider: ethers.providers.Provider) {
    this.provider = provider;
  }

  /**
   * Получить баланс токенов пользователя
   */
  async getTokenBalances(userAddress: string) {
    if (!this.provider) {
      throw new Error('Service not initialized');
    }

    try {
      console.log('🔄 Getting token balances for:', userAddress);

      const balances = [];

      // USDT
      const usdtContract = new ethers.Contract(TOKEN_ADDRESSES.USDT, TOKEN_ABI, this.provider);
      const usdtBalance = await usdtContract.balanceOf(userAddress);
      const usdtDecimals = await usdtContract.decimals();
      const usdtFormatted = parseFloat(ethers.utils.formatUnits(usdtBalance, usdtDecimals));
      
      balances.push({
        symbol: 'USDT',
        balance: usdtFormatted,
        decimals: usdtDecimals,
        address: TOKEN_ADDRESSES.USDT,
        name: 'Tether USD',
        valueUSD: usdtFormatted
      });

      console.log('💰 USDT Balance:', usdtFormatted);

      // BTC
      const btcContract = new ethers.Contract(TOKEN_ADDRESSES.BTC, TOKEN_ABI, this.provider);
      const btcBalance = await btcContract.balanceOf(userAddress);
      const btcDecimals = await btcContract.decimals();
      const btcFormatted = parseFloat(ethers.utils.formatUnits(btcBalance, btcDecimals));
      
      balances.push({
        symbol: 'BTC',
        balance: btcFormatted,
        decimals: btcDecimals,
        address: TOKEN_ADDRESSES.BTC,
        name: 'Bitcoin',
        valueUSD: btcFormatted * 110000 // Примерная цена
      });

      console.log('💰 BTC Balance:', btcFormatted);

      // ETH
      const ethContract = new ethers.Contract(TOKEN_ADDRESSES.ETH, TOKEN_ABI, this.provider);
      const ethBalance = await ethContract.balanceOf(userAddress);
      const ethDecimals = await ethContract.decimals();
      const ethFormatted = parseFloat(ethers.utils.formatUnits(ethBalance, ethDecimals));
      
      balances.push({
        symbol: 'ETH',
        balance: ethFormatted,
        decimals: ethDecimals,
        address: TOKEN_ADDRESSES.ETH,
        name: 'Ethereum',
        valueUSD: ethFormatted * 3000 // Примерная цена
      });

      console.log('💰 ETH Balance:', ethFormatted);

      console.log('✅ All balances loaded:', balances);
      return balances;

    } catch (error) {
      console.error('❌ Error getting balances:', error);
      return [];
    }
  }

  /**
   * Получить общую стоимость портфолио
   */
  async getTotalValue(userAddress: string): Promise<number> {
    try {
      const balances = await this.getTokenBalances(userAddress);
      return balances.reduce((total, token) => total + token.valueUSD, 0);
    } catch (error) {
      console.error('Error getting total value:', error);
      return 0;
    }
  }
}

export const simpleBalanceService = new SimpleBalanceService();
