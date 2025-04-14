
/**
 * Rate limit status management utilities
 */

import { toast } from "@/hooks/use-toast";
import { getBackoffTime } from "./rateLimitConfig";

// Rate limit state tracking
const RATE_LIMIT_KEY = 'meta_rate_limit_timestamp';
const RATE_LIMIT_HISTORY_KEY = 'meta_rate_limit_history';

/**
 * Check if the app is currently rate limited
 */
export const checkRateLimitStatus = () => {
  const timestamp = localStorage.getItem(RATE_LIMIT_KEY);
  if (!timestamp) {
    return {
      isRateLimited: false,
      timeRemaining: null,
      rateLimitTimestamp: null
    };
  }

  const rateLimitTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const diffMinutes = (rateLimitTime - currentTime) / (1000 * 60);
  
  // If more than 10 minutes have passed, clear the rate limit
  if (diffMinutes <= 0) {
    clearRateLimit();
    return {
      isRateLimited: false,
      timeRemaining: null,
      rateLimitTimestamp: null
    };
  }

  return {
    isRateLimited: true,
    timeRemaining: Math.ceil(diffMinutes),
    rateLimitTimestamp: timestamp
  };
};

/**
 * Mark the app as rate limited for a period of time
 */
export const markRateLimited = (minutes = 10) => {
  const futureTime = new Date();
  futureTime.setMinutes(futureTime.getMinutes() + minutes);
  localStorage.setItem(RATE_LIMIT_KEY, futureTime.toISOString());
  
  // Add to rate limit history for adaptive backoff
  const history = JSON.parse(localStorage.getItem(RATE_LIMIT_HISTORY_KEY) || '[]');
  history.push(new Date().toISOString());
  if (history.length > 10) {
    history.shift(); // Keep only the 10 most recent entries
  }
  localStorage.setItem(RATE_LIMIT_HISTORY_KEY, JSON.stringify(history));
  
  return {
    isRateLimited: true,
    timeRemaining: minutes,
    rateLimitTimestamp: futureTime.toISOString()
  };
};

/**
 * Clear the rate limit status
 */
export const clearRateLimit = () => {
  localStorage.removeItem(RATE_LIMIT_KEY);
  return {
    isRateLimited: false,
    timeRemaining: null,
    rateLimitTimestamp: null
  };
};

/**
 * Show a toast notification about rate limiting
 */
export const notifyRateLimit = (timeRemaining: number) => {
  toast({
    title: "Meta API Rate Limited",
    description: `Please wait ${timeRemaining} minute${timeRemaining !== 1 ? 's' : ''} before trying again.`,
    variant: "destructive",
    duration: 6000,
  });
};

/**
 * Check if we should throttle fetches to prevent rate limits
 */
export const shouldThrottleFetch = () => {
  // Get rate limit history
  const history = JSON.parse(localStorage.getItem(RATE_LIMIT_HISTORY_KEY) || '[]');
  const recentRateLimits = history.filter((timestamp: string) => {
    const rateTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const diffMinutes = (currentTime - rateTime) / (1000 * 60);
    return diffMinutes < 60; // Rate limits in the last hour
  }).length;
  
  // If we've had multiple rate limits recently, throttle more aggressively
  const lastFetchTime = localStorage.getItem('last_api_fetch_time');
  if (!lastFetchTime) return false;
  
  const currentTime = new Date().getTime();
  const lastFetch = new Date(lastFetchTime).getTime();
  const timeSinceLastFetch = currentTime - lastFetch;
  
  // Calculate minimum wait time based on recent rate limit history
  let minWaitTime = 2000; // 2 seconds base
  if (recentRateLimits > 0) {
    minWaitTime = Math.min(recentRateLimits * 5000, 30000); // Up to 30 seconds
  }
  
  return timeSinceLastFetch < minWaitTime;
};
