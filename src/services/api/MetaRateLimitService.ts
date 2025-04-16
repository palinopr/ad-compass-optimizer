
import { RateLimitManager } from './rate-limit/RateLimitManager';

// Initialize the rate limit manager on import
RateLimitManager.initRateLimitState();

export class MetaRateLimitService {
  // Rate limit management - forwarding from RateLimitManager
  public static isRateLimited = RateLimitManager.isRateLimited;
  public static getRateLimitInfo = RateLimitManager.getRateLimitInfo;
  public static getRateLimitTimeRemaining = RateLimitManager.getRateLimitTimeRemaining;
  public static clearRateLimit = RateLimitManager.clearRateLimit;
  public static overrideRateLimit = RateLimitManager.overrideRateLimit;
  public static isRateLimitOverridden = RateLimitManager.isRateLimitOverridden;
}
