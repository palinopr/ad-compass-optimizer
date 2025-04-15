
/**
 * Throttling logic for Meta Campaign API requests
 */
import { MockApiService } from '../mock/MockApiService';

export class CampaignThrottling {
  private static readonly THROTTLE_KEY = 'meta_campaign_fetch_timestamp';
  private static readonly MIN_INTERVAL_MS = 30000; // 30 second cooldown
  private static readonly MANUAL_FETCH_KEY = 'last_manual_campaign_fetch';

  public static isMockMode(): boolean {
    return MockApiService.isMockMetaApiMode() || localStorage.getItem("USE_MOCK_MODE") === "true";
  }

  public static checkThrottling(accountId?: string): void {
    if (this.isMockMode()) {
      console.log('✅ Throttling bypassed - mock mode active');
      return;
    }
    
    const now = Date.now();
    const lastFetchStr = localStorage.getItem(this.THROTTLE_KEY);
    const lastFetch = lastFetchStr ? Number(lastFetchStr) : 0;
    
    if (now - lastFetch < this.MIN_INTERVAL_MS) {
      const remainingSeconds = Math.ceil((this.MIN_INTERVAL_MS - (now - lastFetch)) / 1000);
      const error = new Error('⏳ Please wait 30 seconds between refreshes to avoid API limits');
      error.name = 'ThrottleError';
      throw error;
    }
    
    // Store the fetch timestamp
    localStorage.setItem(this.THROTTLE_KEY, now.toString());
    localStorage.setItem(this.MANUAL_FETCH_KEY, new Date().toISOString());
    console.log('✅ Campaign fetch throttle check passed');
  }

  public static clearThrottling(): void {
    localStorage.removeItem(this.THROTTLE_KEY);
  }

  public static getLastManualFetchTime(): string | null {
    return localStorage.getItem(this.MANUAL_FETCH_KEY);
  }
}
