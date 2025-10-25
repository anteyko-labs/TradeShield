import { getRealCryptoPrices } from './realDataService';

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

class PriceService {
  private prices: Map<string, TokenPrice> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPriceUpdates();
  }

  private async startPriceUpdates() {
    // Обновляем цены каждые 5 секунд
    this.updateInterval = setInterval(async () => {
      await this.updatePrices();
    }, 5000);

    // Первоначальное обновление
    await this.updatePrices();
  }

  private async updatePrices() {
    try {
      const realPrices = await getRealCryptoPrices();
      
      realPrices.forEach(priceData => {
        this.prices.set(priceData.symbol, {
          symbol: priceData.symbol,
          price: priceData.price,
          change24h: priceData.changePercent24h,
          volume24h: priceData.volume24h
        });
      });

      // Добавляем USDT как базовую валюту
      this.prices.set('USDT', {
        symbol: 'USDT',
        price: 1,
        change24h: 0,
        volume24h: 0
      });

    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  getPrice(symbol: string): number {
    return this.prices.get(symbol)?.price || 0;
  }

  getTokenPrice(symbol: string): TokenPrice | undefined {
    return this.prices.get(symbol);
  }

  getAllPrices(): TokenPrice[] {
    return Array.from(this.prices.values());
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

export const priceService = new PriceService();