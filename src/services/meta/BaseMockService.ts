
import { RequestQueueManager } from '../api/queue/RequestQueueManager';
import { CampaignThrottling } from '../api/campaign/throttling';
import { MockApiService } from '../api/mock/MockApiService';

export abstract class BaseMockService {
  protected static readonly API_VERSION = 'v17.0';
  protected static readonly BASE_URL = 'https://graph.facebook.com';

  // Check if mock mode is enabled
  protected static isMockMode(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Check for mock mode in localStorage or URL params
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem("USE_MOCK_MODE") === "true" || 
               localStorage.getItem("USE_MOCK_META_API") === "true";
      }
      
      // Check URL parameters as backup
      try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('mock') === 'true' || urlParams.get('mockMeta') === 'true';
      } catch (e) {
        console.error("Error checking URL parameters:", e);
      }
      
      return false;
    } catch (e) {
      console.error("Error checking mock mode:", e);
      return false;
    }
  }

  // Specific check for a named mock service
  protected static checkMockMode(serviceName: string): boolean {
    const mockEnabled = this.isMockMode();
    if (mockEnabled) {
      console.log(`🎭 Using mock ${serviceName} data`);
    }
    return mockEnabled;
  }

  // Sync mock campaigns to global state
  public static syncMockCampaignsToState(campaigns: any[]): void {
    try {
      if (typeof window === 'undefined') return;
      
      console.log(`🎭 Syncing ${campaigns.length} mock campaigns to state`);
      
      // Store the campaigns in localStorage for state management
      localStorage.setItem('mock_campaigns_data', JSON.stringify(campaigns));
      
      // Store the sync timestamp
      localStorage.setItem('last_mock_sync', new Date().toISOString());
      
      // Store the account ID if available
      if (campaigns.length > 0 && campaigns[0].ad_account_id) {
        localStorage.setItem('last_mock_sync_adaccount', campaigns[0].ad_account_id);
      }
      
      // Trigger an event for components to listen to
      const syncEvent = new CustomEvent('sync-mock-campaigns', { 
        detail: { campaigns } 
      });
      window.dispatchEvent(syncEvent);
    } catch (e) {
      console.error('Error syncing mock campaigns to state:', e);
    }
  }

  // Updated to use proper throttling logic
  public static async executeWithRateLimiting<T>(
    requestFn: () => Promise<T>, 
    options: { bypassQueue?: boolean, skipRateLimitCheck?: boolean } = {}
  ): Promise<T> {
    // Check throttling using CampaignThrottling
    try {
      CampaignThrottling.checkThrottling();
    } catch (throttleError: any) {
      console.warn('API request throttled:', throttleError.message);
      
      if (options.bypassQueue) {
        throw throttleError;
      }
      
      // Queue the request if not bypassing queue
      return RequestQueueManager.addToQueue(requestFn);
    }
    
    try {
      return await requestFn();
    } catch (error: any) {
      // Check if it's a rate limit error
      const isRateLimit = error?.code === 4 || 
                          error?.code === 17 || 
                          error?.status === 429 ||
                          (error?.message && error?.message.toLowerCase().includes('rate limit'));
      
      if (isRateLimit) {
        console.warn('Rate limit detected:', error.message || 'Rate limit error');
        
        if (options.bypassQueue) {
          throw error;
        }
        
        // Queue the request
        return RequestQueueManager.addToQueue(requestFn);
      }
      
      throw error;
    }
  }
}
