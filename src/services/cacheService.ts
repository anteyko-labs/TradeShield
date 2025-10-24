// Cache service to reduce API calls and avoid rate limits
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 30000; // 30 seconds

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache stats for debugging
  getStats() {
    const now = Date.now();
    const stats = {
      total: this.cache.size,
      expired: 0,
      valid: 0
    };

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        stats.expired++;
      } else {
        stats.valid++;
      }
    }

    return stats;
  }
}

export const cacheService = new CacheService();
