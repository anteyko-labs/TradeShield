// Rate limiter service to prevent API abuse
class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly WINDOW_SIZE = 60000; // 1 minute
  private readonly MAX_REQUESTS = 10; // Max 10 requests per minute

  canMakeRequest(api: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(api) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.WINDOW_SIZE);
    
    if (validRequests.length >= this.MAX_REQUESTS) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(api, validRequests);
    
    return true;
  }

  getTimeUntilNextRequest(api: string): number {
    const requests = this.requests.get(api) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const timeUntilWindowReset = this.WINDOW_SIZE - (Date.now() - oldestRequest);
    
    return Math.max(0, timeUntilWindowReset);
  }

  reset(api: string): void {
    this.requests.delete(api);
  }

  getStats(api: string): { requests: number; timeUntilReset: number } {
    const requests = this.requests.get(api) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.WINDOW_SIZE);
    
    return {
      requests: validRequests.length,
      timeUntilReset: this.getTimeUntilNextRequest(api)
    };
  }
}

export const rateLimiter = new RateLimiter();
