
/**
 * Throttling logic for Meta Campaign API requests
 */
export class CampaignThrottling {
  private static readonly THROTTLE_KEY = 'meta_campaign_fetch_timestamp';
  private static readonly MIN_INTERVAL_MS = 60000; // 1 minute cooldown

  public static isMockMode(): boolean {
    // Use consistent mock detection from localStorage
    return localStorage.getItem("USE_MOCK_MODE") === "true";
  }

  public static checkThrottling(accountId?: string): void {
    // Skip throttling checks entirely in mock mode
    if (this.isMockMode()) {
      console.log('✅ Throttling bypassed - mock mode active');
      return;
    }
    
    const now = Date.now();
    const lastFetchStr = localStorage.getItem(this.THROTTLE_KEY);
    const lastFetch = lastFetchStr ? Number(lastFetchStr) : 0;
    
    if (now - lastFetch < this.MIN_INTERVAL_MS) {
      const remainingSeconds = Math.ceil((this.MIN_INTERVAL_MS - (now - lastFetch)) / 1000);
      console.warn(`⏳ Skipping campaign fetch — rate limit cooldown active (${remainingSeconds}s remaining)`);
      throw new Error(`Campaign fetch throttled. Please wait ${remainingSeconds} seconds before retrying.`);
    }
    
    localStorage.setItem(this.THROTTLE_KEY, now.toString());
    console.log('✅ Campaign fetch throttle check passed');
  }

  public static clearThrottling(): void {
    localStorage.removeItem(this.THROTTLE_KEY);
  }
}
