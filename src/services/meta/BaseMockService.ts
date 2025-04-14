
import { MockApiService } from '../api/mock/MockApiService';
import { RateLimitManager } from '../api/rate-limit/RateLimitManager';
import { RequestQueueManager } from '../api/queue/RequestQueueManager';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

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

  protected static async executeWithRateLimiting<T>(
    requestFn: () => Promise<T>, 
    options: { bypassQueue?: boolean, skipRateLimitCheck?: boolean } = {}
  ): Promise<T> {
    if (this.isMockMode()) {
      console.log('🎭 Bypassing API call in mock mode');
      return Promise.resolve({} as T);
    }

    if (!options.skipRateLimitCheck && RateLimitManager.isRateLimited() && !RateLimitManager.isRateLimitOverridden()) {
      const remainingTime = RateLimitManager.getRateLimitTimeRemaining();
      console.log(`API is rate limited. Remaining time: ${remainingTime} seconds`);
      
      if (options.bypassQueue) {
        throw new Error(`API rate limit in effect. Please retry after ${remainingTime} seconds.`);
      }
      
      return RequestQueueManager.addToQueue(requestFn);
    }
    
    try {
      return await requestFn();
    } catch (error: any) {
      if (this.isRateLimitError(error)) {
        const { retryAfter, code, message } = this.handleRateLimitError(error);
        RateLimitManager.setRateLimit(retryAfter, { code, message });
        
        if (options.bypassQueue) {
          throw error;
        }
        
        return RequestQueueManager.addToQueue(requestFn);
      }
      
      throw error;
    }
  }

  private static isRateLimitError(error: any): boolean {
    return error?.code === 4 || error?.code === 17 || error?.code === 32 ||
           (error?.code >= 80000 && error?.code <= 80014);
  }

  private static handleRateLimitError(error: any): { retryAfter: number, code: number, message: string } {
    return {
      retryAfter: error.retryAfter || 60,
      code: error.code,
      message: error.message || 'Rate limit exceeded'
    };
  }
}
