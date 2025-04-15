
import { RateLimitManager } from './api/rate-limit/RateLimitManager';

export class MetaApiService {
  public static isMockMode(): boolean {
    return false;
  }

  // Rate limit management methods
  public static isRateLimited(): boolean {
    return RateLimitManager.isRateLimited();
  }

  public static getRateLimitTimeRemaining(): number | null {
    return RateLimitManager.getRateLimitTimeRemaining();
  }

  public static getRateLimitInfo(): any {
    return RateLimitManager.getRateLimitInfo();
  }

  public static clearRateLimit(): void {
    RateLimitManager.clearRateLimit();
  }

  public static overrideRateLimit(override: boolean = true): void {
    RateLimitManager.overrideRateLimit(override);
  }

  public static isRateLimitOverridden(): boolean {
    return RateLimitManager.isRateLimitOverridden();
  }
}

RateLimitManager.initRateLimitState();
