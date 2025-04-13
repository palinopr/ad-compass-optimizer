
import { toast } from "@/hooks/use-toast";

/**
 * Handles rate limiting logic and cached data retrieval
 */
export const checkRateLimitStatus = (): { 
  isRateLimited: boolean; 
  timeRemaining: number | null;
  rateLimitTimestamp: string | null;
} => {
  const rateLimitTime = localStorage.getItem('meta_rate_limit_timestamp');
  
  if (!rateLimitTime) {
    return { 
      isRateLimited: false, 
      timeRemaining: null,
      rateLimitTimestamp: null
    };
  }
  
  const limitTime = new Date(rateLimitTime).getTime();
  const now = new Date().getTime();
  const minutesSince = Math.floor((now - limitTime) / (1000 * 60));
  
  // If rate limited in the last 5 minutes
  if (minutesSince < 5) {
    const remainingTime = 5 - minutesSince;
    return {
      isRateLimited: true,
      timeRemaining: remainingTime,
      rateLimitTimestamp: rateLimitTime
    };
  }
  
  // Clear the rate limit flag if it's been more than 5 minutes
  localStorage.removeItem('meta_rate_limit_timestamp');
  return { 
    isRateLimited: false, 
    timeRemaining: null,
    rateLimitTimestamp: null
  };
};

export const markRateLimited = (): void => {
  localStorage.setItem('meta_rate_limit_timestamp', new Date().toISOString());
};

export const notifyRateLimit = (remainingTime?: number): void => {
  toast({
    title: "Rate Limit Detected",
    description: `Facebook's API is rate limited. Please wait approximately ${remainingTime || 5} more minutes.`,
    duration: 7000,
  });
};

export const isRateLimitError = (error: any): boolean => {
  if (!error) return false;
  
  // Check message content
  if (typeof error.message === 'string' && 
      (error.message.includes('rate limit') || 
       error.message.includes('request limit'))) {
    return true;
  }
  
  // Check response data
  if (error.details?.error?.code === 4) {
    return true;
  }
  
  return false;
};
