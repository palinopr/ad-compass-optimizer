
/**
 * Throttling logic for Meta Campaign API requests
 */
export class CampaignThrottling {
  private static readonly THROTTLE_KEY = 'meta_campaign_fetch_timestamp';
  private static readonly MIN_INTERVAL_MS = 30000; // 30 second cooldown
  private static readonly MANUAL_FETCH_KEY = 'last_manual_campaign_fetch';

  public static checkThrottling(accountId?: string): void {
    const now = Date.now();
    const lastFetchStr = localStorage.getItem(this.THROTTLE_KEY);
    const lastFetch = lastFetchStr ? Number(lastFetchStr) : 0;
    
    if (now - lastFetch < this.MIN_INTERVAL_MS) {
      const remainingSeconds = Math.ceil((this.MIN_INTERVAL_MS - (now - lastFetch)) / 1000);
      const error = new Error(`⏳ Please wait ${remainingSeconds} seconds before refreshing to avoid API limits`);
      error.name = 'ThrottleError';
      throw error;
    }
    
    // Store the fetch timestamp
    localStorage.setItem(this.THROTTLE_KEY, now.toString());
    
    // Record the manual fetch time with ISO string format for display
    const fetchTime = new Date().toISOString();
    localStorage.setItem(this.MANUAL_FETCH_KEY, fetchTime);
    console.log(`✅ Campaign fetch throttle check passed at ${fetchTime}`);
    console.log(`✅ Using account: ${accountId || 'unknown'}`);
  }

  public static clearThrottling(): void {
    localStorage.removeItem(this.THROTTLE_KEY);
  }

  public static getLastManualFetchTime(): string | null {
    return localStorage.getItem(this.MANUAL_FETCH_KEY);
  }
}
