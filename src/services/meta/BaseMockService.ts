
import { MockApiService } from '../api/mock/MockApiService';
import { RateLimitManager } from '../api/rate-limit/RateLimitManager';
import { RequestQueueManager } from '../api/queue/RequestQueueManager';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { CampaignThrottling } from '../api/campaign/throttling';

export abstract class BaseMockService {
  protected static readonly API_VERSION = 'v17.0';
  protected static readonly BASE_URL = 'https://graph.facebook.com';

  protected static isMockMode(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      
      if (typeof localStorage !== 'undefined') {
        try {
          return MockApiService.isMockMetaApiMode() || localStorage.getItem("USE_MOCK_MODE") === "true";
        } catch (e) {
          console.error("Error accessing localStorage in BaseMockService:", e);
        }
      }
      
      return false;
    } catch (e) {
      console.error("Error checking mock mode in BaseMockService:", e);
      return false;
    }
  }

  protected static checkMockMode(operation: string): boolean {
    if (this.isMockMode()) {
      console.warn(`🎭 [Mock Mode] Attempted to call real ${operation} while in mock mode. Using mock data instead.`);
      return true;
    }
    return false;
  }

  // Public method to support synchronization from MetaFunnelService
  public static syncMockCampaignsToState(campaigns: any[]): void {
    try {
      if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
        console.log('🎭 [Mock Sync] No campaigns to sync');
        return;
      }
      
      console.log(`🎭 [Mock Sync] Syncing ${campaigns.length} mock campaigns to global state`);
      
      // Create a custom event with the campaigns data
      if (typeof window === 'undefined') {
        console.log('🎭 [Mock Sync] Cannot sync campaigns - not in browser environment');
        return;
      }
      
      const syncEvent = new CustomEvent('sync-mock-campaigns', { 
        detail: { campaigns } 
      });
      
      // Safely dispatch the event
      // Dispatch the event to be caught by the campaign state hooks
      window.dispatchEvent(syncEvent);
      
      // Also trigger a campaign refresh to ensure UI updates
      triggerCampaignRefresh(false);
    } catch (e) {
      console.error("Error syncing mock campaigns to state:", e);
      // Fail silently in production - don't break the app
    }
  }

  // Updated to use proper throttling logic instead of a non-existent method
  public static async executeWithRateLimiting<T>(
    requestFn: () => Promise<T>, 
    options: { bypassQueue?: boolean, skipRateLimitCheck?: boolean } = {}
  ): Promise<T> {
    if (this.isMockMode()) {
      console.log('🎭 Bypassing API call in mock mode');
      return Promise.resolve({} as T);
    }

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
