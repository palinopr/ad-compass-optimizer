
/**
 * Rate limit status management utilities
 */

import { toast } from "@/hooks/use-toast";
import { getBackoffTime } from "./rateLimitConfig";

// Rate limit state tracking
const RATE_LIMIT_KEY_PREFIX = 'meta_rate_limit_timestamp_';
const RATE_LIMIT_HISTORY_KEY_PREFIX = 'meta_rate_limit_history_';

/**
 * Get account-specific storage key
 */
const getAccountSpecificKey = (key: string, accountId?: string) => {
  if (!accountId) return key;
  return `${key}${accountId}`;
};

/**
 * Check if the app is currently rate limited
 */
export const checkRateLimitStatus = (accountId?: string) => {
  const key = getAccountSpecificKey(RATE_LIMIT_KEY_PREFIX, accountId);
  const timestamp = localStorage.getItem(key);
  
  if (!timestamp) {
    return {
      isRateLimited: false,
      timeRemaining: null,
      rateLimitTimestamp: null,
      accountId
    };
  }

  const rateLimitTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const diffMinutes = (rateLimitTime - currentTime) / (1000 * 60);
  
  // If more than 10 minutes have passed, clear the rate limit
  if (diffMinutes <= 0) {
    clearRateLimit(accountId);
    return {
      isRateLimited: false,
      timeRemaining: null,
      rateLimitTimestamp: null,
      accountId
    };
  }

  return {
    isRateLimited: true,
    timeRemaining: Math.ceil(diffMinutes),
    rateLimitTimestamp: timestamp,
    accountId
  };
};

/**
 * Mark the app as rate limited for a period of time
 */
export const markRateLimited = (minutes = 10, accountId?: string) => {
  const futureTime = new Date();
  futureTime.setMinutes(futureTime.getMinutes() + minutes);
  
  const key = getAccountSpecificKey(RATE_LIMIT_KEY_PREFIX, accountId);
  localStorage.setItem(key, futureTime.toISOString());
  
  // Add to rate limit history for adaptive backoff
  const historyKey = getAccountSpecificKey(RATE_LIMIT_HISTORY_KEY_PREFIX, accountId);
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  history.push(new Date().toISOString());
  if (history.length > 10) {
    history.shift(); // Keep only the 10 most recent entries
  }
  localStorage.setItem(historyKey, JSON.stringify(history));
  
  return {
    isRateLimited: true,
    timeRemaining: minutes,
    rateLimitTimestamp: futureTime.toISOString(),
    accountId
  };
};

/**
 * Clear the rate limit status
 */
export const clearRateLimit = (accountId?: string) => {
  const key = getAccountSpecificKey(RATE_LIMIT_KEY_PREFIX, accountId);
  localStorage.removeItem(key);
  return {
    isRateLimited: false,
    timeRemaining: null,
    rateLimitTimestamp: null,
    accountId
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
export const shouldThrottleFetch = (accountId?: string) => {
  // Get rate limit history
  const historyKey = getAccountSpecificKey(RATE_LIMIT_HISTORY_KEY_PREFIX, accountId);
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  const recentRateLimits = history.filter((timestamp: string) => {
    const rateTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const diffMinutes = (currentTime - rateTime) / (1000 * 60);
    return diffMinutes < 60; // Rate limits in the last hour
  }).length;
  
  // If we've had multiple rate limits recently, throttle more aggressively
  const lastFetchTime = localStorage.getItem('last_api_fetch_time' + (accountId ? `_${accountId}` : ''));
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
