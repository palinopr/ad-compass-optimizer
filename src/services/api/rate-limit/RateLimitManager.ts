
interface RateLimitState {
  isRateLimited: boolean;
  timestamp?: number;
  retryAfter?: number;
  limitType?: 'app' | 'user' | 'adaccount' | 'unknown';
  errorCode?: number;
  errorMessage?: string;
}

export class RateLimitManager {
  private static rateLimitState: RateLimitState = {
    isRateLimited: false
  };
  
  private static readonly RATE_LIMIT_STORAGE_KEY = 'meta_api_rate_limit';

  public static initRateLimitState() {
    try {
      const storedState = localStorage.getItem(this.RATE_LIMIT_STORAGE_KEY);
      if (storedState) {
        const parsedState: RateLimitState = JSON.parse(storedState);
        
        if (parsedState.timestamp && Date.now() - parsedState.timestamp < 3600000) {
          this.rateLimitState = parsedState;
          console.log('Restored rate limit state:', this.rateLimitState);
        } else {
          localStorage.removeItem(this.RATE_LIMIT_STORAGE_KEY);
          this.rateLimitState = { isRateLimited: false };
        }
      }
    } catch (e) {
      console.error('Error loading rate limit state:', e);
    }
  }

  public static isRateLimited(): boolean {
    if (!this.rateLimitState.isRateLimited) return false;
    
    if (this.rateLimitState.timestamp && this.rateLimitState.retryAfter) {
      const currentTime = Date.now();
      const expiryTime = this.rateLimitState.timestamp + (this.rateLimitState.retryAfter * 1000);
      
      if (currentTime > expiryTime) {
        console.log('Rate limit has expired, clearing state');
        this.clearRateLimit();
        return false;
      }
      
      return true;
    }
    
    if (this.rateLimitState.timestamp) {
      const currentTime = Date.now();
      const defaultExpiryTime = this.rateLimitState.timestamp + (5 * 60 * 1000);
      
      if (currentTime > defaultExpiryTime) {
        console.log('Rate limit has expired (default 5min), clearing state');
        this.clearRateLimit();
        return false;
      }
    }
    
    return this.rateLimitState.isRateLimited;
  }

  public static getRateLimitTimeRemaining(): number | null {
    if (!this.rateLimitState.isRateLimited || !this.rateLimitState.timestamp) {
      return null;
    }
    
    const currentTime = Date.now();
    const expiryTime = this.rateLimitState.timestamp + 
      ((this.rateLimitState.retryAfter || 300) * 1000);
    
    const remainingMs = expiryTime - currentTime;
    if (remainingMs <= 0) {
      this.clearRateLimit();
      return null;
    }
    
    return Math.ceil(remainingMs / 1000);
  }

  public static getRateLimitInfo(): RateLimitState {
    return { ...this.rateLimitState };
  }

  public static setRateLimit(retryAfter?: number, errorDetails?: { code?: number, message?: string }) {
    const retrySeconds = retryAfter || 300;
    let limitType: 'app' | 'user' | 'adaccount' | 'unknown' = 'unknown';
    
    if (errorDetails?.code === 4) {
      limitType = 'app';
    } else if (errorDetails?.code === 17) {
      limitType = 'user';
    } else if (errorDetails?.code === 32 || (errorDetails?.code && errorDetails.code >= 80000 && errorDetails.code <= 80014)) {
      limitType = 'adaccount';
    }
    
    this.rateLimitState = {
      isRateLimited: true,
      timestamp: Date.now(),
      retryAfter: retrySeconds,
      limitType: limitType,
      errorCode: errorDetails?.code,
      errorMessage: errorDetails?.message
    };
    
    localStorage.setItem(this.RATE_LIMIT_STORAGE_KEY, JSON.stringify(this.rateLimitState));
    localStorage.setItem('meta_rate_limit_timestamp', new Date().toISOString());
    localStorage.setItem('meta_rate_limit_retry_after', String(retrySeconds));
    localStorage.setItem('meta_rate_limit_type', limitType);
    if (errorDetails?.message) {
      localStorage.setItem('meta_rate_limit_message', errorDetails.message);
    }
    
    const event = new CustomEvent('meta-api-rate-limited', { 
      detail: { 
        retryAfter: retrySeconds,
        limitType: limitType,
        errorCode: errorDetails?.code,
        errorMessage: errorDetails?.message
      } 
    });
    window.dispatchEvent(event);
    
    console.warn(`Meta API rate limited (${limitType}). Will retry after ${retrySeconds} seconds`);
  }

  public static clearRateLimit() {
    this.rateLimitState = { isRateLimited: false };
    localStorage.removeItem(this.RATE_LIMIT_STORAGE_KEY);
    localStorage.removeItem('meta_rate_limit_timestamp');
    localStorage.removeItem('meta_rate_limit_retry_after');
    localStorage.removeItem('meta_rate_limit_type');
    localStorage.removeItem('meta_rate_limit_message');
    
    console.log('Rate limit cleared');
    window.dispatchEvent(new Event('meta-api-rate-limit-cleared'));
  }

  public static overrideRateLimit(override: boolean = true) {
    if (override) {
      this.clearRateLimit();
    }
    localStorage.setItem('meta_rate_limit_override', String(override));
  }

  public static isRateLimitOverridden(): boolean {
    return localStorage.getItem('meta_rate_limit_override') === 'true';
  }
}
