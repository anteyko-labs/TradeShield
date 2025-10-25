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
 * Сервис для реального обмена токенов с актуальными курсами
 */
export class RealExchangeService {
  public provider: ethers.providers.Provider | null = null;
  public signer: ethers.Signer | null = null;

  async initialize(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Получить актуальные курсы с CoinGecko
   */
  async getRealExchangeRates() {
    try {
      const response = await fetch('/api/coingecko/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd');
      const data = await response.json();
      
      return {
        BTC: data.bitcoin.usd,
        ETH: data.ethereum.usd,
        USDT: 1.0 // USDT всегда равен 1 USD
      };
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback курсы
      return {
        BTC: 110000,
        ETH: 3000,
        USDT: 1.0
      };
    }
  }

  /**
   * Выполнить обмен токенов по реальному курсу
   */
  async executeExchange(
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    userAddress: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.signer) {
      throw new Error('Service not initialized');
    }

    try {
      // Получаем актуальные курсы
      const rates = await this.getRealExchangeRates();
      
      // Рассчитываем количество токенов для обмена с правильными десятичными знаками
      let amountOut: number;
      if (tokenIn === 'USDT' && tokenOut === 'USDT') {
        // Специальный случай: USDT -> USDT (минтинг)
        amountOut = amountIn; // Просто даем столько же USDT
      } else if (tokenIn === 'USDT' && tokenOut === 'BTC') {
        amountOut = amountIn / rates.BTC; // USDT / BTC_price
      } else if (tokenIn === 'USDT' && tokenOut === 'ETH') {
        amountOut = amountIn / rates.ETH; // USDT / ETH_price
      } else if (tokenIn === 'BTC' && tokenOut === 'USDT') {
        amountOut = amountIn * rates.BTC; // BTC * BTC_price
      } else if (tokenIn === 'ETH' && tokenOut === 'USDT') {
        amountOut = amountIn * rates.ETH; // ETH * ETH_price
      } else if (tokenIn === 'BTC' && tokenOut === 'ETH') {
        amountOut = (amountIn * rates.BTC) / rates.ETH; // BTC -> USDT -> ETH
      } else if (tokenIn === 'ETH' && tokenOut === 'BTC') {
        amountOut = (amountIn * rates.ETH) / rates.BTC; // ETH -> USDT -> BTC
      } else {
        throw new Error(`Unsupported exchange: ${tokenIn} -> ${tokenOut}`);
      }

      // Округляем до правильного количества десятичных знаков
      const decimals = tokenOut === 'USDT' ? 6 : tokenOut === 'BTC' ? 8 : 18;
      amountOut = Math.floor(amountOut * Math.pow(10, decimals)) / Math.pow(10, decimals);

      console.log(`💱 Exchange: ${amountIn} ${tokenIn} -> ${amountOut.toFixed(8)} ${tokenOut}`);
      console.log(`📊 Rates: BTC=${rates.BTC}, ETH=${rates.ETH}, USDT=${rates.USDT}`);

      // Получаем контракты токенов
      const tokenInContract = new ethers.Contract(
        TOKEN_ADDRESSES[tokenIn as keyof typeof TOKEN_ADDRESSES],
        TOKEN_ABI,
        this.signer
      );
      const tokenOutContract = new ethers.Contract(
        TOKEN_ADDRESSES[tokenOut as keyof typeof TOKEN_ADDRESSES],
        TOKEN_ABI,
        this.signer
      );

      // Проверяем баланс (кроме случая USDT -> USDT)
      let requiredAmount;
      if (!(tokenIn === 'USDT' && tokenOut === 'USDT')) {
        const userBalance = await tokenInContract.balanceOf(userAddress);
        const tokenInDecimals = await tokenInContract.decimals();
        requiredAmount = ethers.utils.parseUnits(
          amountIn.toFixed(tokenInDecimals), 
          tokenInDecimals
        );

        if (userBalance.lt(requiredAmount)) {
          return {
            success: false,
            error: `Insufficient ${tokenIn} balance`
          };
        }
      }

      // Выполняем обмен через прямые переводы
      if (tokenIn === 'USDT' && tokenOut === 'USDT') {
        // Специальный случай: USDT -> USDT (просто минтим, не сжигаем)
        const tokenOutDecimals = await tokenOutContract.decimals();
        const mintAmount = ethers.utils.parseUnits(
          amountOut.toFixed(tokenOutDecimals),
          tokenOutDecimals
        );

        const mintTx = await tokenOutContract.mint(userAddress, mintAmount);
        await mintTx.wait();

        console.log(`✅ USDT minted: ${amountOut.toFixed(tokenOutDecimals)} USDT to ${userAddress}`);

        return {
          success: true,
          txHash: mintTx.hash
        };
      } else {
        // Обычный обмен: сжигаем входящие, минтим исходящие
        // 1. Сжигаем входящие токены
        const burnTx = await tokenInContract.transfer(
          '0x000000000000000000000000000000000000dEaD',
          requiredAmount
        );
        await burnTx.wait();

        // 2. Минтим исходящие токены напрямую пользователю
        const tokenOutDecimals = await tokenOutContract.decimals();
        const mintAmount = ethers.utils.parseUnits(
          amountOut.toFixed(tokenOutDecimals),
          tokenOutDecimals
        );

        const mintTx = await tokenOutContract.mint(userAddress, mintAmount);
        await mintTx.wait();

        console.log(`✅ Tokens exchanged: ${amountIn} ${tokenIn} -> ${amountOut.toFixed(tokenOutDecimals)} ${tokenOut}`);

        return {
          success: true,
          txHash: mintTx.hash
        };
      }

    } catch (error) {
      console.error('Error executing exchange:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Получить курс обмена
   */
  async getExchangeRate(tokenIn: string, tokenOut: string): Promise<number> {
    const rates = await this.getRealExchangeRates();
    
    if (tokenIn === 'USDT' && tokenOut === 'BTC') {
      return 1 / rates.BTC;
    } else if (tokenIn === 'USDT' && tokenOut === 'ETH') {
      return 1 / rates.ETH;
    } else if (tokenIn === 'BTC' && tokenOut === 'USDT') {
      return rates.BTC;
    } else if (tokenIn === 'ETH' && tokenOut === 'USDT') {
      return rates.ETH;
    } else if (tokenIn === 'BTC' && tokenOut === 'ETH') {
      return rates.BTC / rates.ETH;
    } else if (tokenIn === 'ETH' && tokenOut === 'BTC') {
      return rates.ETH / rates.BTC;
    }
    
    return 1;
  }
}

export const realExchangeService = new RealExchangeService();
