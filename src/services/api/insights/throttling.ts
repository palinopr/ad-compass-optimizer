
/**
 * Throttling logic for Meta Insights API requests
 */
import { BaseApiService } from '../BaseApiService';
import { checkRateLimitStatus, markRateLimited } from '@/hooks/campaigns/fetch-utils/rateLimitStatus';
import { shouldThrottleFetch } from '@/hooks/campaigns/fetch-utils/rateLimitStatus';
import { storeApiUsage } from '@/hooks/campaigns/fetch-utils/apiUsage';
import { MockApiService } from '../mock/MockApiService';

export class InsightsThrottling {
  private static lastFetchTime: number = 0;
  private static lastFetchTimes: Record<string, number> = {};
  private static currentAccountId: string | undefined;
  private static requestsPerAccount: Record<string, number> = {};
  private static readonly MIN_DELAY_MS = 500; // Minimum 500ms delay between requests
  
  /**
   * Check and apply throttling as needed
   */
  public static checkThrottling(accountId?: string): void {
    // Skip throttling in mock mode
    if (MockApiService.isMockMetaApiMode()) {
      console.log('🎭 Mock API mode - bypassing throttling checks');
      return;
    }
    
    // Set current account ID for this request
    this.currentAccountId = accountId;
    
    // Apply throttling based on previous fetch time, with account-specific tracking
    const now = Date.now();
    const accountKey = accountId || 'global';
    
    // Check if we're making too many requests for this specific account
    if (this.requestsPerAccount[accountKey]) {
      this.requestsPerAccount[accountKey]++;
      
      // If we're seeing a high number of requests in a short time, forcibly throttle
      if (this.requestsPerAccount[accountKey] > 50) {
        console.warn(`High request volume detected for account ${accountId} - throttling for protection`);
        // Apply a progressive backoff based on request count
        const backoffMs = Math.min(this.requestsPerAccount[accountKey] * 100, 30000); // Cap at 30 seconds
        throw new Error(`Rate protection: Too many requests for account ${accountId}. Please wait ${Math.round(backoffMs/1000)} seconds.`);
      }
    } else {
      this.requestsPerAccount[accountKey] = 1;
      
      // Reset request count after 1 minute to allow normal operation later
      setTimeout(() => {
        if (this.requestsPerAccount[accountKey]) {
          this.requestsPerAccount[accountKey] = 0;
        }
      }, 60000);
    }
    
    // Account-specific throttling based on time since last request
    const lastAccountFetchTime = this.lastFetchTimes[accountKey] || 0;
    const timeSinceLastFetch = now - lastAccountFetchTime;
    
    if (timeSinceLastFetch < this.MIN_DELAY_MS) {
      console.log(`Throttling insights fetch for account ${accountId} - too soon after last fetch (${timeSinceLastFetch}ms)`);
      throw new Error(`Rate limiting: Please wait at least ${this.MIN_DELAY_MS}ms between requests for the same account.`);
    }
    
    // Check if we've recently hit a rate limit for this specific account
    if (shouldThrottleFetch(accountId)) {
      console.log(`Additional throttling applied for account ${accountId} - recent high request volume`);
      throw new Error(`Rate limiting: High request volume detected for account ${accountId}. Please wait before making another request.`);
    }
    
    // Check if we've recently hit a rate limit for this specific account
    const rateStatus = checkRateLimitStatus(accountId);
    if (rateStatus.isRateLimited) {
      console.log(`Rate limit active for account ${accountId}, remaining time: ${rateStatus.timeRemaining} minutes`);
      throw new Error(`Meta API rate limit reached for account ${accountId}. Please wait approximately ${rateStatus.timeRemaining} more minutes.`);
    }
    
    // Update last fetch time - both global and account-specific
    this.lastFetchTime = now;
    this.lastFetchTimes[accountKey] = now;
    
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
    const businessUsage = response.headers.get('x-business-use-case-usage');
    
    // Store both app and business usage data
    if (appUsage || businessUsage) {
      try {
        if (appUsage) {
          const usage = JSON.parse(appUsage);
          
          // Store the app usage data for this specific account
          storeApiUsage({
            type: 'app',
            data: usage
          }, this.currentAccountId);
          
          // If we're over 80% of rate limit, log a warning
          if (usage.call_count > 80 || usage.total_cputime > 80 || usage.total_time > 80) {
            console.warn(`Approaching Meta API rate limits for account ${this.currentAccountId}:`, usage);
          }
          
          // If we're at 100%, mark as rate limited for this account
          if (usage.call_count >= 100 || usage.total_cputime >= 100 || usage.total_time >= 100) {
            const minutes = usage.estimated_time_to_regain_access ? 
              parseInt(usage.estimated_time_to_regain_access) : 15;
            markRateLimited(minutes, this.currentAccountId);
          }
        }
        
        if (businessUsage) {
          try {
            const busUsage = JSON.parse(businessUsage);
            
            // Store the business usage data
            storeApiUsage({
              type: 'business',
              data: busUsage
            }, this.currentAccountId);
            
            // Check for business use case limits
            // Business use case limits are structured differently
            const businessId = Object.keys(busUsage)[0];
            if (businessId && busUsage[businessId][0] && 
                busUsage[businessId][0].estimated_time_to_regain_access) {
              const minutes = parseInt(busUsage[businessId][0].estimated_time_to_regain_access);
              if (minutes > 0) {
                console.warn(`Business use case rate limit detected for account ${this.currentAccountId}, ${minutes} minutes to regain access`);
                markRateLimited(minutes, this.currentAccountId);
              }
            }
          } catch (e) {
            console.error('Error parsing business usage data:', e);
          }
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
      // Try to extract minutes from error message if available
      let minutes = 15; // Default
      const timeMatch = error.message.match(/(\d+)\s*min/);
      if (timeMatch && timeMatch[1]) {
        minutes = parseInt(timeMatch[1]);
      }
      
      markRateLimited(minutes, this.currentAccountId);
      return true;
    }
    
    // Check for rate limit error codes (4, 17, 32, 80000-80014)
    if (error && typeof error === 'object') {
      const errorCode = error.code || 
                      (error.error && error.error.code) || 
                      (error.response && error.response.data && error.response.data.error && error.response.data.error.code);
      
      if (errorCode === 4 || errorCode === 17 || errorCode === 32 || 
          (errorCode >= 80000 && errorCode <= 80014)) {
        console.log(`Rate limit error code detected: ${errorCode}`);
        markRateLimited(15, this.currentAccountId);
        return true;
      }
    }
    
    return false;
  }
}
