import { ethers } from 'ethers';

// Адреса токенов
const TOKEN_ADDRESSES = {
  USDT: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// ABI для токенов
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
  "function mint(address to, uint256 amount) public onlyOwner"
];

/**
 * Простой сервис для минтинга токенов
 */
export class SimpleMintService {
  public provider: ethers.providers.Provider | null = null;
  public signer: ethers.Signer | null = null;

  async initialize(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Минтить USDT пользователю
   */
  async mintUSDT(userAddress: string, amount: number = 10000): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.signer) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const usdtContract = new ethers.Contract(TOKEN_ADDRESSES.USDT, TOKEN_ABI, this.signer);
      const amountParsed = ethers.utils.parseUnits(amount.toString(), 6); // USDT has 6 decimals

      console.log(`🚀 Minting ${amount} USDT to ${userAddress}...`);
      const tx = await usdtContract.mint(userAddress, amountParsed);
      await tx.wait();

      console.log(`✅ ${amount} USDT minted successfully!`);
      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('❌ Error minting USDT:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Минтить BTC пользователю
   */
  async mintBTC(userAddress: string, amount: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.signer) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const btcContract = new ethers.Contract(TOKEN_ADDRESSES.BTC, TOKEN_ABI, this.signer);
      const amountParsed = ethers.utils.parseUnits(amount.toString(), 8); // BTC has 8 decimals

      console.log(`🚀 Minting ${amount} BTC to ${userAddress}...`);
      const tx = await btcContract.mint(userAddress, amountParsed);
      await tx.wait();

      console.log(`✅ ${amount} BTC minted successfully!`);
      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('❌ Error minting BTC:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Минтить ETH пользователю
   */
  async mintETH(userAddress: string, amount: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.signer) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const ethContract = new ethers.Contract(TOKEN_ADDRESSES.ETH, TOKEN_ABI, this.signer);
      const amountParsed = ethers.utils.parseUnits(amount.toString(), 18); // ETH has 18 decimals

      console.log(`🚀 Minting ${amount} ETH to ${userAddress}...`);
      const tx = await ethContract.mint(userAddress, amountParsed);
      await tx.wait();

      console.log(`✅ ${amount} ETH minted successfully!`);
      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('❌ Error minting ETH:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const simpleMintService = new SimpleMintService();
