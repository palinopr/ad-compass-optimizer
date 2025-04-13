import { MetaUserService } from './api/MetaUserService';
import { MetaAdAccountService } from './api/MetaAdAccountService';
import { MetaBusinessService } from './api/MetaBusinessService';
import { MetaConnectionService } from './api/MetaConnectionService';
import MetaCampaignService, { MetaCampaign } from './api/MetaCampaignService';
import MetaInsightsService, { InsightFilterOptions, InsightsResponse } from './api/MetaInsightsService';
import type { ConnectionTestResult } from './api/MetaConnectionService';

/**
 * Rate limit handling configuration
 */
interface RateLimitState {
  isRateLimited: boolean;
  timestamp?: number;
  retryAfter?: number;
  limitType?: 'app' | 'user' | 'adaccount' | 'unknown';
  errorCode?: number;
  errorMessage?: string;
}

/**
 * Meta API Service
 * This class delegates to specialized service classes for different API operations
 */
export class MetaApiService {
  private static readonly API_VERSION = 'v17.0';
  private static readonly BASE_URL = 'https://graph.facebook.com';
  
  // Rate limit tracking
  private static rateLimitState: RateLimitState = {
    isRateLimited: false
  };
  
  // Queue for pending requests
  private static requestQueue: (() => Promise<any>)[] = [];
  private static isProcessingQueue = false;
  private static readonly RATE_LIMIT_STORAGE_KEY = 'meta_api_rate_limit';
  
  /**
   * Initialize the rate limit state from storage on app load
   */
  public static initRateLimitState() {
    try {
      const storedState = localStorage.getItem(this.RATE_LIMIT_STORAGE_KEY);
      if (storedState) {
        const parsedState: RateLimitState = JSON.parse(storedState);
        
        // Only restore if the timestamp is recent (within the last hour)
        if (parsedState.timestamp && Date.now() - parsedState.timestamp < 3600000) {
          this.rateLimitState = parsedState;
          console.log('Restored rate limit state:', this.rateLimitState);
        } else {
          // Clear outdated rate limit state
          localStorage.removeItem(this.RATE_LIMIT_STORAGE_KEY);
          this.rateLimitState = { isRateLimited: false };
        }
      }
    } catch (e) {
      console.error('Error loading rate limit state:', e);
    }
  }

  /**
   * Check if the API is currently rate limited
   */
  public static isRateLimited(): boolean {
    // If we're not rate limited, return false
    if (!this.rateLimitState.isRateLimited) return false;
    
    // Check if the rate limit has expired
    if (this.rateLimitState.timestamp && this.rateLimitState.retryAfter) {
      const currentTime = Date.now();
      const expiryTime = this.rateLimitState.timestamp + (this.rateLimitState.retryAfter * 1000);
      
      // If the rate limit has expired, clear it
      if (currentTime > expiryTime) {
        console.log('Rate limit has expired, clearing state');
        this.clearRateLimit();
        return false;
      }
      
      // Rate limit is still active
      return true;
    }
    
    // If we have a rate limit but no timing info, assume it's expired after 5 minutes
    if (this.rateLimitState.timestamp) {
      const currentTime = Date.now();
      const defaultExpiryTime = this.rateLimitState.timestamp + (5 * 60 * 1000); // 5 minutes
      
      if (currentTime > defaultExpiryTime) {
        console.log('Rate limit has expired (default 5min), clearing state');
        this.clearRateLimit();
        return false;
      }
    }
    
    return this.rateLimitState.isRateLimited;
  }

  /**
   * Get the estimated time remaining until the rate limit expires
   */
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
    
    // Return remaining time in seconds
    return Math.ceil(remainingMs / 1000);
  }

  /**
   * Get the current rate limit state information
   */
  public static getRateLimitInfo(): RateLimitState {
    return { ...this.rateLimitState };
  }

  /**
   * Set a rate limit based on an API response
   */
  public static setRateLimit(retryAfter?: number, errorDetails?: { code?: number, message?: string }) {
    // Default to 5 minutes if no retry-after header
    const retrySeconds = retryAfter || 300;
    
    // Determine the type of rate limit
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
    
    // Store in localStorage
    localStorage.setItem(this.RATE_LIMIT_STORAGE_KEY, JSON.stringify(this.rateLimitState));
    
    // Store additional info for diagnostics
    localStorage.setItem('meta_rate_limit_timestamp', new Date().toISOString());
    localStorage.setItem('meta_rate_limit_retry_after', String(retrySeconds));
    localStorage.setItem('meta_rate_limit_type', limitType);
    if (errorDetails?.message) {
      localStorage.setItem('meta_rate_limit_message', errorDetails.message);
    }
    
    // Dispatch event for rate limit
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

  /**
   * Clear the current rate limit state
   */
  public static clearRateLimit() {
    this.rateLimitState = { isRateLimited: false };
    localStorage.removeItem(this.RATE_LIMIT_STORAGE_KEY);
    localStorage.removeItem('meta_rate_limit_timestamp');
    localStorage.removeItem('meta_rate_limit_retry_after');
    localStorage.removeItem('meta_rate_limit_type');
    localStorage.removeItem('meta_rate_limit_message');
    
    console.log('Rate limit cleared');
    
    // Dispatch event for rate limit cleared
    window.dispatchEvent(new Event('meta-api-rate-limit-cleared'));
    
    // Process any queued requests
    this.processQueue();
  }

  /**
   * Manually override rate limit check
   */
  public static overrideRateLimit(override: boolean = true) {
    if (override) {
      this.clearRateLimit();
    }
    localStorage.setItem('meta_rate_limit_override', String(override));
  }

  /**
   * Check if rate limit override is active
   */
  public static isRateLimitOverridden(): boolean {
    return localStorage.getItem('meta_rate_limit_override') === 'true';
  }

  /**
   * Add a request to the queue to be executed when rate limit expires
   */
  private static addToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          const result = await requestFn();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };
      
      this.requestQueue.push(wrappedRequest);
      console.log(`Request added to queue. Queue size: ${this.requestQueue.length}`);
      
      // Try to process the queue
      this.processQueue();
    });
  }

  /**
   * Process the queue of pending requests
   */
  private static async processQueue() {
    // If we're already processing or rate limited, don't start another process
    if (this.isProcessingQueue || (this.isRateLimited() && !this.isRateLimitOverridden())) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      // Process requests one by one with a delay
      while (this.requestQueue.length > 0 && (!this.isRateLimited() || this.isRateLimitOverridden())) {
        const request = this.requestQueue.shift();
        if (request) {
          try {
            await request();
            // Add a small delay between requests to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error: any) {
            console.error('Error processing queued request:', error);
            // Check if this was a rate limit error
            if (this.isRateLimitError(error)) {
              this.handleRateLimitError(error);
              break; // Stop processing queue
            }
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Check if an error is a rate limit error
   */
  private static isRateLimitError(error: any): boolean {
    if (!error) return false;
    
    // Check for explicit rate limit codes
    const errorCode = error?.code || error?.error?.code || (error?.error?.error && error?.error?.error.code);
    if (errorCode === 4 || errorCode === 17 || errorCode === 32 || 
        (errorCode >= 80000 && errorCode <= 80014)) {
      return true;
    }
    
    // Check for rate limit in error message
    const errorMessage = error?.message || error?.error?.message || 
                        (error?.error?.error && error?.error?.error.message);
    
    if (errorMessage && typeof errorMessage === 'string' && (
      errorMessage.includes('rate limit') || 
      errorMessage.includes('request limit') ||
      errorMessage.includes('too many calls')
    )) {
      return true;
    }
    
    return false;
  }

  /**
   * Handle rate limit errors
   */
  private static handleRateLimitError(error: any) {
    // Extract retry time if available
    let retryAfter = 300; // Default to 5 minutes
    if (error.headers?.['retry-after']) {
      retryAfter = parseInt(error.headers['retry-after'], 10);
    } else if (error.retryAfter) {
      retryAfter = parseInt(error.retryAfter, 10);
    }
    
    // Extract error code and message
    const errorCode = error?.code || error?.error?.code || (error?.error?.error && error?.error?.error.code);
    const errorMessage = error?.message || error?.error?.message || 
                        (error?.error?.error && error?.error?.error.message);
    
    this.setRateLimit(retryAfter, { code: errorCode, message: errorMessage });
    
    // Log the detailed error for debugging
    console.warn('Rate limit error details:', { 
      code: errorCode, 
      message: errorMessage, 
      retryAfter
    });
  }

  /**
   * Execute an API request with rate limit handling
   */
  public static async executeWithRateLimiting<T>(
    requestFn: () => Promise<T>, 
    options: { bypassQueue?: boolean, skipRateLimitCheck?: boolean } = {}
  ): Promise<T> {
    // Check if we're currently rate limited and not overridden
    if (!options.skipRateLimitCheck && this.isRateLimited() && !this.isRateLimitOverridden()) {
      const remainingTime = this.getRateLimitTimeRemaining();
      console.log(`API is rate limited (${this.rateLimitState.limitType}). Remaining time: ${remainingTime} seconds`);
      
      if (options.bypassQueue) {
        throw new Error(`API rate limit (${this.rateLimitState.limitType}) in effect. Please retry after ${remainingTime} seconds.`);
      }
      
      // Add to queue to be executed later
      return this.addToQueue(requestFn);
    }
    
    try {
      // Execute the request
      return await requestFn();
    } catch (error: any) {
      // Check for rate limit errors
      if (this.isRateLimitError(error)) {
        this.handleRateLimitError(error);
        
        if (options.bypassQueue) {
          throw error;
        }
        
        // Add to queue to be executed later
        return this.addToQueue(requestFn);
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Fetch user data using a Meta access token
   */
  public static async fetchUserData(token: string) {
    return this.executeWithRateLimiting(() => 
      MetaUserService.fetchUserData(token)
    );
  }

  /**
   * Fetch ad accounts for the authenticated user
   */
  public static async fetchAdAccounts(token: string) {
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccounts(token)
    );
  }

  /**
   * Fetch details for a specific ad account by ID
   */
  public static async fetchAdAccountDetails(token: string, accountId: string) {
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccountDetails(token, accountId)
    );
  }

  /**
   * Test Meta API connection with the provided token
   */
  public static async testConnection(token: string): Promise<ConnectionTestResult> {
    // Skip queue for connection test
    return this.executeWithRateLimiting(() => 
      MetaConnectionService.testConnection(token)
    , { bypassQueue: true });
  }

  /**
   * Fetch business managers for the authenticated user
   */
  public static async fetchBusinessManagers(token: string) {
    return this.executeWithRateLimiting(() => 
      MetaBusinessService.fetchBusinessManagers(token)
    );
  }

  /**
   * Fetch ad accounts for a specific business manager
   */
  public static async fetchAdAccountsForBusiness(token: string, businessId: string) {
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccountsForBusiness(token, businessId)
    );
  }
  
  /**
   * Fetch campaigns for a specific ad account
   */
  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    return this.executeWithRateLimiting(() => 
      MetaCampaignService.fetchCampaigns(token, adAccountId)
    );
  }

  /**
   * Fetch insights for any Meta ad object
   */
  public static async fetchInsights(token: string, objectId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchInsights(token, objectId, options)
    );
  }

  /**
   * Fetch insights for a campaign
   */
  public static async fetchCampaignInsights(token: string, campaignId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchCampaignInsights(token, campaignId, options)
    );
  }

  /**
   * Fetch insights for an ad account
   */
  public static async fetchAccountInsights(token: string, accountId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchAccountInsights(token, accountId, options)
    );
  }

  /**
   * Fetch insights with demographic breakdowns
   */
  public static async fetchDemographicInsights(token: string, objectId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchDemographicInsights(token, objectId, options)
    );
  }

  /**
   * Fetch insights with geographic breakdowns
   */
  public static async fetchGeographicInsights(token: string, objectId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchGeographicInsights(token, objectId, options)
    );
  }
}

// Initialize rate limit state on import
MetaApiService.initRateLimitState();
