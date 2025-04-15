
import { toast } from '@/hooks/use-toast';

interface RateLimitStatus {
  isRateLimited: boolean;
  timeRemaining: number; // minutes
  expiryTime?: number;
}

/**
 * Check if the current account is rate limited
 */
export const checkRateLimitStatus = (adAccountId: string): RateLimitStatus => {
  try {
    const rlKey = `rate_limit_${adAccountId}`;
    const rateLimitData = localStorage.getItem(rlKey);
    
    if (!rateLimitData) {
      return { isRateLimited: false, timeRemaining: 0 };
    }
    
    const { expiryTime } = JSON.parse(rateLimitData);
    const now = Date.now();
    
    if (now > expiryTime) {
      // Rate limit has expired
      localStorage.removeItem(rlKey);
      return { isRateLimited: false, timeRemaining: 0 };
    }
    
    // Still rate limited
    const timeRemainingMs = expiryTime - now;
    const timeRemainingMinutes = Math.ceil(timeRemainingMs / (60 * 1000));
    
    return { 
      isRateLimited: true, 
      timeRemaining: timeRemainingMinutes,
      expiryTime 
    };
  } catch (e) {
    console.error('Error checking rate limit status:', e);
    return { isRateLimited: false, timeRemaining: 0 };
  }
};

/**
 * Mark an account as rate limited
 */
export const markRateLimited = (minutesDuration: number = 10, adAccountId: string): RateLimitStatus => {
  try {
    const rlKey = `rate_limit_${adAccountId}`;
    const now = Date.now();
    const expiryTime = now + (minutesDuration * 60 * 1000);
    
    localStorage.setItem(rlKey, JSON.stringify({ expiryTime }));
    
    return {
      isRateLimited: true,
      timeRemaining: minutesDuration,
      expiryTime
    };
  } catch (e) {
    console.error('Error marking rate limit:', e);
    return { isRateLimited: false, timeRemaining: 0 };
  }
};

/**
 * Show rate limit notification
 */
export const notifyRateLimit = (timeRemaining: number): void => {
  toast({
    title: "Meta API Rate Limited",
    description: `Too many requests sent to Meta. Try again in ${timeRemaining} minute${timeRemaining !== 1 ? 's' : ''}.`,
    variant: "destructive",
    duration: 10000,
  });
};
