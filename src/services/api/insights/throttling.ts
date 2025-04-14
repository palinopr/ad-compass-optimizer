
/**
 * Throttling logic for Meta Insights API requests
 */
import { BaseApiService } from '../BaseApiService';
import { checkRateLimitStatus, markRateLimited } from '@/hooks/campaigns/fetch-utils/rateLimitStatus';
import { shouldThrottleFetch } from '@/hooks/campaigns/fetch-utils/rateLimitStatus';

export class InsightsThrottling {
  private static lastFetchTime: number = 0;
  private static currentAccountId: string | undefined;
  
  /**
   * Check and apply throttling as needed
   */
  public static checkThrottling(accountId?: string): void {
    // Set current account ID for this request
    this.currentAccountId = accountId;
    
    // Apply throttling based on previous fetch time
    const now = Date.now();
    if (shouldThrottleFetch(accountId)) {
      console.log(`Throttling insights fetch for account ${accountId} - too soon after last fetch`);
      throw new Error('Rate limiting: Please wait before making another request');
    }
    
    // Check if we've recently hit a rate limit
    const rateStatus = checkRateLimitStatus(accountId);
    if (rateStatus.isRateLimited) {
      console.log(`Rate limit active for account ${accountId}, remaining time: ${rateStatus.timeRemaining} minutes`);
      throw new Error(`Meta API rate limit reached. Please wait approximately ${rateStatus.timeRemaining} more minutes.`);
    }
    
    // Update last fetch time
    this.lastFetchTime = now;
    
    // Store fetch time per account
    if (accountId) {
      localStorage.setItem(`last_api_fetch_time_${accountId}`, new Date().toISOString());
    } else {
      localStorage.setItem('last_api_fetch_time', new Date().toISOString());
    }
  }
  
  /**
   * Monitor response headers for rate limit information
   */
  public static monitorResponseHeaders(response: Response): void {
    const appUsage = response.headers.get('x-app-usage');
    if (appUsage) {
      try {
        const usage = JSON.parse(appUsage);
        // If we're over 80% of rate limit, log a warning
        if (usage.call_count > 80 || usage.total_cputime > 80 || usage.total_time > 80) {
          console.warn('Approaching Meta API rate limits:', usage);
        }
        
        // If we're at 100%, mark as rate limited
        if (usage.call_count >= 100 || usage.total_cputime >= 100 || usage.total_time >= 100) {
          markRateLimited(15, this.currentAccountId);
        }
      } catch (e) {
        console.error('Error parsing API usage data:', e);
      }
    }
  }
  
  /**
   * Check if error is related to rate limiting
   */
  public static checkErrorForRateLimit(error: any): boolean {
    if (error instanceof Error && (
      error.message.includes('rate limit') || 
      error.message.includes('request limit') ||
      error.message.includes('too many calls')
    )) {
      markRateLimited(15, this.currentAccountId);
      return true;
    }
    return false;
  }
}
